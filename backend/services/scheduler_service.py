"""
Планировщик напоминаний о приёмах пищи.

Каждую минуту (в :00 секунд) проверяет, совпадает ли текущее время
(в часовом поясе пользователя) с настроенным временем завтрака/обеда/ужина.
Если совпадает — отправляет уведомление.
"""

import threading
import os
from datetime import datetime, timedelta, timezone as tz
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from apscheduler.schedulers.background import BackgroundScheduler

# Трекер дубликатов: {(user_id, meal_type): "YYYY-MM-DD"}
_sent_tracker = {}
_tracker_lock = threading.Lock()

# PID lock file для предотвращения запуска нескольких scheduler'ов
_scheduler_lock_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.scheduler_lock')

# Файл блокировки для отправки уведомлений (работает между процессами)
_notification_lock_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.notification_lock')

MEAL_NOTIFICATIONS = {
    'breakfast': {
        'title': 'Время завтрака! 🍳',
        'body': 'Не забудьте позавтракать и зафиксировать приём пищи',
    },
    'lunch': {
        'title': 'Время обеда! 🍽️',
        'body': 'Пора пообедать и записать что съели',
    },
    'dinner': {
        'title': 'Время ужина! 🌙',
        'body': 'Не забудьте поужинать и отметить приём пищи',
    },
}

scheduler = None
_timezone_column_exists = None  # кеш: есть ли колонка timezone в БД


def _acquire_scheduler_lock():
    """Пытается захватить лок-файл для scheduler. Возвращает True если успешно."""
    try:
        # Попытка создать/открыть файл в монопольном режиме
        lock_file = open(_scheduler_lock_file, 'w')
        
        # Проверяем, запущен ли уже другой scheduler
        try:
            pid = lock_file.read().strip()
            if pid:
                try:
                    # Проверяем, существует ли процесс с этим PID
                    os.kill(int(pid), 0)
                    # Если процесс существует, не запускаем scheduler
                    lock_file.close()
                    return None
                except (OSError, ProcessLookupError):
                    # Процесс не существует, можно запустить scheduler
                    pass
        except (ValueError, IOError):
            pass
        
        # Записываем текущий PID
        lock_file.seek(0)
        lock_file.write(str(os.getpid()))
        lock_file.truncate()
        lock_file.flush()
        return lock_file
    except (IOError, OSError):
        return None


def _acquire_notification_lock():
    """
    Блокировка для отправки уведомлений (кросс-процессная).
    Возвращает None если блокировка не получена, иначе файловый дескриптор.
    """
    try:
        lock_file = open(_notification_lock_file, 'a')
        if hasattr(lock_file, 'fileno'):
            # Попытка заблокировать файл (неблокирующий режим)
            try:
                import msvcrt
                msvcrt.locking(lock_file.fileno(), msvcrt.LK_NBLCK, 1)
                return lock_file
            except (ImportError, OSError):
                # msvcrt не доступен или блокировка не удалась
                pass
        
        # На Linux/macOS используем fcntl
        try:
            import fcntl
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            return lock_file
        except (ImportError, OSError):
            pass
            
        # Если блокировка не поддерживается, возвращаем None
        lock_file.close()
        return None
    except (IOError, OSError):
        return None


def _release_notification_lock(lock_file):
    """Освобождает блокировку."""
    if lock_file is None:
        return
    try:
        if hasattr(lock_file, 'fileno'):
            try:
                import msvcrt
                msvcrt.locking(lock_file.fileno(), msvcrt.LK_UNLCK, 1)
            except (ImportError, OSError):
                pass
            
            try:
                import fcntl
                fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)
            except (ImportError, OSError):
                pass
        lock_file.close()
    except (IOError, OSError):
        pass


def _ensure_timezone_column(db):
    """Проверяет и при необходимости добавляет колонку timezone в БД."""
    global _timezone_column_exists
    if _timezone_column_exists:
        return True
    try:
        db.session.execute(db.text(
            "ALTER TABLE notification_preferences ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC'"
        ))
        db.session.commit()
        print("[Scheduler] Auto-migrated: added 'timezone' column")
        _timezone_column_exists = True
    except Exception:
        # Колонка уже существует (duplicate column) — это нормально
        db.session.rollback()
        _timezone_column_exists = True
    return True


def _get_user_timezone(prefs):
    """Безопасно получить часовой пояс пользователя."""
    try:
        tz_str = getattr(prefs, 'timezone', None) or 'UTC'
    except Exception:
        tz_str = 'UTC'

    try:
        return ZoneInfo(tz_str), tz_str
    except (ZoneInfoNotFoundError, Exception):
        return ZoneInfo('UTC'), 'UTC'


def check_meal_reminders(app):
    """Основная задача планировщика. Вызывается каждую минуту в :00 секунд."""
    with app.app_context():
        from models import db, NotificationPreference, Notification
        from services.push_service import PushService
        from services import websocket_service

        now_utc = datetime.now(tz.utc)
        print(f"[Scheduler] Tick at {now_utc.strftime('%Y-%m-%d %H:%M:%S')} UTC")

        # Автомиграция колонки timezone если нужно
        _ensure_timezone_column(db)

        try:
            prefs_list = NotificationPreference.query.filter_by(
                meal_reminders=True
            ).all()
        except Exception as e:
            print(f"[Scheduler] DB query error: {e}")
            db.session.rollback()
            return

        print(f"[Scheduler] Users with meal_reminders=True: {len(prefs_list)}")

        for prefs in prefs_list:
            user_id = prefs.user_id
            user_tz, user_tz_str = _get_user_timezone(prefs)

            # Текущее время в часовом поясе пользователя
            user_now = now_utc.astimezone(user_tz)
            user_hhmm = user_now.strftime('%H:%M')
            user_date = user_now.strftime('%Y-%m-%d')

            meal_times = {
                'breakfast': prefs.breakfast_time or '08:00',
                'lunch': prefs.lunch_time or '13:00',
                'dinner': prefs.dinner_time or '19:00',
            }

            print(f"[Scheduler] user={user_id} tz={user_tz_str} localtime={user_hhmm} meals={meal_times}")

            for meal_type, configured_time in meal_times.items():
                if user_hhmm != configured_time:
                    continue

                print(f"[Scheduler] MATCH user={user_id} meal={meal_type} time={configured_time}")

                notif_data = MEAL_NOTIFICATIONS[meal_type]
                
                # Пытаемся получить блокировку для отправки уведомления
                lock_file = _acquire_notification_lock()
                if lock_file is None:
                    # Блокировка НЕ получена - проверяем БД и пропускаем если есть уведомление
                    print(f"[Scheduler] No lock for user={user_id} meal={meal_type}, checking DB...")
                    existing = Notification.query.filter(
                        Notification.user_id == user_id,
                        Notification.category == 'meal_reminder',
                        Notification.title == notif_data['title'],
                    ).first()
                    if existing:
                        print(f"[Scheduler] Skip (notification already exists id={existing.id})")
                        with _tracker_lock:
                            _sent_tracker[(user_id, meal_type)] = user_date
                        continue
                    else:
                        # Нет в БД, но нет и блокировки - это значит другой процесс
                        # уже проверил и создаст уведомление, пропускаем
                        print(f"[Scheduler] Skip (no lock, another process will handle)")
                        continue
                else:
                    # Блокировка получена - мы главные
                    try:
                        # Проверяем любое уведомление за сегодня (SQLite не поддерживает FOR UPDATE)
                        today_start = user_now.replace(
                            hour=0, minute=0, second=0, microsecond=0
                        ).astimezone(tz.utc)
                        existing = Notification.query.filter(
                            Notification.user_id == user_id,
                            Notification.category == 'meal_reminder',
                            Notification.title == notif_data['title'],
                            Notification.created_at >= today_start,
                        ).first()
                        
                        if existing:
                            print(f"[Scheduler] Skip (notification already sent today at {existing.created_at})")
                            with _tracker_lock:
                                _sent_tracker[(user_id, meal_type)] = user_date
                            continue
                        
                        # Создаём уведомление внутри транзакции
                        notification = Notification(
                            user_id=user_id,
                            title=notif_data['title'],
                            body=notif_data['body'],
                            category='meal_reminder',
                        )
                        db.session.add(notification)
                        db.session.commit()
                        
                        print(f"[Scheduler] Created notification id={notification.id}")
                        
                        # Обновляем in-memory трекер
                        with _tracker_lock:
                            _sent_tracker[(user_id, meal_type)] = user_date
                        
                        # Отправляем через WebSocket
                        websocket_service.send_notification(user_id, notification.to_dict())
                        
                        # Отправляем обновлённый счётчик непрочитанных
                        unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
                        websocket_service.send_unread_count(user_id, unread)
                        
                        # Проверяем нужно ли отправлять push
                        should_push = (
                            prefs.push_enabled and 
                            prefs.meal_reminders
                        )
                        
                        if should_push:
                            PushService.send_to_user(user_id, notification)
                        
                        print(f"[Scheduler] SENT {meal_type} reminder to user {user_id}")
                        
                    except Exception as e:
                        print(f"[Scheduler] Error: {e}")
                        db.session.rollback()
                    finally:
                        _release_notification_lock(lock_file)

        _cleanup_tracker()


def check_weekly_reports(app):
    """
    Проверяет, нужно ли отправить еженедельный push-отчёт.
    Запускается каждую минуту (без ограничения на день недели),
    потому что понедельник пользователя может не совпадать с понедельником сервера (UTC).
    Проверяет >= 10:00 (а не ==), чтобы догнать уведомление при простое сервера.
    """
    with app.app_context():
        from models import db, NotificationPreference, Notification
        from services.push_service import create_and_push_notification

        now_utc = datetime.now(tz.utc)

        try:
            prefs_list = NotificationPreference.query.filter_by(
                weekly_reports=True
            ).all()
        except Exception as e:
            print(f"[WeeklyReport] DB query error: {e}")
            db.session.rollback()
            return

        for prefs in prefs_list:
            user_id = prefs.user_id
            user_tz, user_tz_str = _get_user_timezone(prefs)
            user_now = now_utc.astimezone(user_tz)

            # Проверяем: понедельник + время >= 10:00 (догоняем если пропустили)
            if user_now.weekday() != 0:
                continue
            user_hour = user_now.hour
            user_minute = user_now.minute
            if user_hour < 10:
                continue

            user_date = user_now.strftime('%Y-%m-%d')
            tracker_key = (user_id, 'weekly_report')

            # Проверяем дубликат в трекере
            with _tracker_lock:
                if _sent_tracker.get(tracker_key) == user_date:
                    continue

            # Проверяем дубликат в БД
            today_start = user_now.replace(
                hour=0, minute=0, second=0, microsecond=0
            ).astimezone(tz.utc)
            existing = Notification.query.filter(
                Notification.user_id == user_id,
                Notification.category == 'weekly_report',
                Notification.created_at >= today_start,
            ).first()
            if existing:
                with _tracker_lock:
                    _sent_tracker[tracker_key] = user_date
                continue

            try:
                create_and_push_notification(
                    user_id=user_id,
                    title='Еженедельный отчёт готов! 📊',
                    body='Посмотрите сводку за неделю: средние КБЖУ и персональные советы от ИИ',
                    category='weekly_report',
                )
                with _tracker_lock:
                    _sent_tracker[tracker_key] = user_date
                print(f"[WeeklyReport] Sent to user {user_id} (local {user_now.strftime('%H:%M')} {user_tz_str})")
            except Exception as e:
                print(f"[WeeklyReport] Error for user {user_id}: {e}")
                db.session.rollback()


def _cleanup_tracker():
    """Удаляет устаревшие записи из трекера (за прошедшие дни)."""
    today_str = datetime.now(tz.utc).strftime('%Y-%m-%d')
    with _tracker_lock:
        stale_keys = [k for k, v in _sent_tracker.items() if v < today_str]
        for k in stale_keys:
            del _sent_tracker[k]


def init_scheduler(app):
    """Инициализация и запуск планировщика. Вызывается один раз из create_app()."""
    global scheduler

    if scheduler is not None:
        return

    # Пытаемся захватить лок-файл, чтобы только один процесс запустил scheduler
    lock = _acquire_scheduler_lock()
    if lock is None:
        print("[Scheduler] Another process is already running scheduler, skipping")
        return

    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(
        func=check_meal_reminders,
        trigger='cron',
        second=0,  # Каждую минуту ровно в :00 секунд
        args=[app],
        id='meal_reminders_job',
        name='Check meal reminder times',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=30,
    )
    scheduler.add_job(
        func=check_weekly_reports,
        trigger='cron',
        second=0,  # Каждую минуту в :00 секунд (день проверяется внутри функции по timezone)
        args=[app],
        id='weekly_reports_job',
        name='Check weekly report times',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=300,
    )
    scheduler.start()
    print("[Scheduler] Scheduler started (meal reminders + weekly reports)")
