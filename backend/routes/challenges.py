from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, GroupChallenge, ChallengeParticipant, PairStreak, GroupMember, Meal
from datetime import datetime, timezone, date, timedelta
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

challenges_bp = Blueprint('challenges', __name__)


def _ensure_pair_streak_columns():
    """Добавить новые колонки pair_streaks если их нет (для существующих БД)."""
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE pair_streaks ADD COLUMN status VARCHAR(20) DEFAULT 'active'"))
            conn.commit()
    except Exception:
        pass
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE pair_streaks ADD COLUMN invited_by_id INTEGER REFERENCES users(id)"))
            conn.commit()
    except Exception:
        pass



# ─── Вспомогательные функции ──────────────────────────────────────────────────

def update_challenge_progress(user_id):
    """Пересчитать прогресс пользователя во всех активных челленджах.
    Вызывается после каждого логирования еды."""
    try:
        today = date.today()

        # Все активные челленджи где пользователь участвует
        participations = (
            ChallengeParticipant.query
            .join(GroupChallenge)
            .filter(
                ChallengeParticipant.user_id == user_id,
                ChallengeParticipant.status == 'active',
                GroupChallenge.status == 'active',
                GroupChallenge.end_date >= today,
            )
            .all()
        )

        if not participations:
            return

        # Суммарные данные за сегодня
        today_meals = Meal.query.filter_by(user_id=user_id, meal_date=today).all()
        today_calories = sum(m.calories or 0 for m in today_meals)
        today_protein = sum(m.protein or 0 for m in today_meals)
        today_meals_count = len(today_meals)
        logged_today = today_meals_count > 0

        for p in participations:
            ch = p.challenge
            ctype = ch.challenge_type

            if ctype == 'calories':
                p.current_progress = today_calories
            elif ctype == 'protein':
                p.current_progress = today_protein
            elif ctype == 'meals_count':
                p.current_progress = today_meals_count
            elif ctype == 'logging_streak':
                # Подсчитываем streak: сколько дней подряд есть записи до сегодня включительно
                streak = 0
                check_date = today
                while True:
                    has_meal = Meal.query.filter_by(user_id=user_id, meal_date=check_date).first()
                    if has_meal:
                        streak += 1
                        check_date -= timedelta(days=1)
                    else:
                        break
                p.current_progress = streak

            # Проверить завершение
            if ctype in ('calories', 'protein', 'meals_count'):
                # Прогресс = текущее значение / цель (0..1 для отображения)
                if p.current_progress >= ch.target_value:
                    p.status = 'completed'
                    p.completed_at = datetime.now(timezone.utc)
            elif ctype == 'logging_streak':
                if p.current_progress >= ch.target_value:
                    p.status = 'completed'
                    p.completed_at = datetime.now(timezone.utc)

        db.session.commit()
    except Exception as e:
        logger.warning(f"[update_challenge_progress] error for user {user_id}: {e}")
        db.session.rollback()


def update_pair_streaks(user_id):
    """Обновить парные стрики пользователя.
    Вызывается после каждого логирования еды."""
    try:
        today = date.today()

        # Проверяем, есть ли у пользователя хоть одна запись сегодня
        user_logged_today = Meal.query.filter_by(user_id=user_id, meal_date=today).first() is not None
        if not user_logged_today:
            return

        # Только активные pair streaks (принятые обеими сторонами)
        streaks = PairStreak.query.filter(
            (PairStreak.user1_id == user_id) | (PairStreak.user2_id == user_id),
            PairStreak.status == 'active',
        ).all()

        for streak in streaks:
            # Не обновлять если уже синхронизировано сегодня
            if streak.last_sync_date == today:
                continue

            partner_id = streak.user2_id if streak.user1_id == user_id else streak.user1_id

            # Проверяем залогировал ли партнёр сегодня
            partner_logged = Meal.query.filter_by(user_id=partner_id, meal_date=today).first() is not None

            if partner_logged:
                # Оба залогировали — проверяем непрерывность
                yesterday = today - timedelta(days=1)
                if streak.last_sync_date == yesterday:
                    # Непрерывный стрик — продолжаем
                    streak.current_streak += 1
                else:
                    # Разрыв (пропустили вчера) — сброс или первый день
                    streak.current_streak = 1

                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak

                streak.last_sync_date = today
            # Если партнёр ещё не залогировал — ждём, не сбрасываем стрик

        db.session.commit()
    except Exception as e:
        logger.warning(f"[update_pair_streaks] error for user {user_id}: {e}")
        db.session.rollback()


def _check_group_member(group_id, user_id):
    """Вернуть запись участника группы или None."""
    return GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()


# ─── Челленджи ────────────────────────────────────────────────────────────────

@challenges_bp.route('/groups/<int:group_id>/challenges', methods=['GET'])
@jwt_required()
def list_challenges(group_id):
    """Список активных/завершённых челленджей группы."""
    user_id = int(get_jwt_identity())
    member = _check_group_member(group_id, user_id)
    if not member:
        return jsonify({'error': 'Нет доступа к группе'}), 403

    challenges = GroupChallenge.query.filter_by(group_id=group_id).order_by(
        GroupChallenge.created_at.desc()
    ).all()

    return jsonify([c.to_dict(current_user_id=user_id) for c in challenges])


@challenges_bp.route('/groups/<int:group_id>/challenges', methods=['POST'])
@jwt_required()
def create_challenge(group_id):
    """Создать челлендж (только owner/admin группы)."""
    user_id = int(get_jwt_identity())
    member = _check_group_member(group_id, user_id)
    if not member or member.role not in ('owner', 'admin'):
        return jsonify({'error': 'Только владелец или администратор может создавать вызовы'}), 403

    data = request.get_json() or {}
    required = ('title', 'challenge_type', 'target_value', 'duration_days')
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Поле {field} обязательно'}), 400

    valid_types = ('calories', 'protein', 'meals_count', 'logging_streak')
    if data['challenge_type'] not in valid_types:
        return jsonify({'error': f'Неверный тип вызова. Допустимые: {valid_types}'}), 400

    today = date.today()
    duration = int(data['duration_days'])
    end = today + timedelta(days=duration - 1)

    challenge = GroupChallenge(
        group_id=group_id,
        creator_id=user_id,
        title=data['title'],
        description=data.get('description', ''),
        challenge_type=data['challenge_type'],
        target_value=float(data['target_value']),
        duration_days=duration,
        start_date=today,
        end_date=end,
        status='active',
    )
    db.session.add(challenge)
    db.session.flush()

    # Создатель автоматически становится участником
    p = ChallengeParticipant(challenge_id=challenge.id, user_id=user_id)
    db.session.add(p)
    db.session.commit()

    return jsonify(challenge.to_dict(current_user_id=user_id)), 201


@challenges_bp.route('/groups/<int:group_id>/challenges/<int:challenge_id>/join', methods=['POST'])
@jwt_required()
def join_challenge(group_id, challenge_id):
    """Вступить в челлендж."""
    user_id = int(get_jwt_identity())
    if not _check_group_member(group_id, user_id):
        return jsonify({'error': 'Нет доступа к группе'}), 403

    challenge = GroupChallenge.query.filter_by(id=challenge_id, group_id=group_id).first()
    if not challenge:
        return jsonify({'error': 'Вызов не найден'}), 404
    if challenge.status != 'active':
        return jsonify({'error': 'Вызов уже завершён'}), 400

    existing = ChallengeParticipant.query.filter_by(
        challenge_id=challenge_id, user_id=user_id
    ).first()
    if existing:
        return jsonify({'message': 'Уже участвуете', 'challenge': challenge.to_dict(current_user_id=user_id)})

    p = ChallengeParticipant(challenge_id=challenge_id, user_id=user_id)
    db.session.add(p)
    db.session.commit()

    return jsonify(challenge.to_dict(current_user_id=user_id)), 201


@challenges_bp.route('/groups/<int:group_id>/challenges/<int:challenge_id>/board', methods=['GET'])
@jwt_required()
def leaderboard(group_id, challenge_id):
    """Лидерборд участников челленджа."""
    user_id = int(get_jwt_identity())
    if not _check_group_member(group_id, user_id):
        return jsonify({'error': 'Нет доступа к группе'}), 403

    challenge = GroupChallenge.query.filter_by(id=challenge_id, group_id=group_id).first()
    if not challenge:
        return jsonify({'error': 'Вызов не найден'}), 404

    participants = (
        ChallengeParticipant.query
        .filter_by(challenge_id=challenge_id)
        .order_by(ChallengeParticipant.current_progress.desc())
        .all()
    )

    board = []
    for rank, p in enumerate(participants, start=1):
        entry = p.to_dict()
        entry['rank'] = rank
        entry['progressPct'] = round(
            min(100, (p.current_progress / challenge.target_value) * 100), 1
        ) if challenge.target_value else 0
        board.append(entry)

    return jsonify({'challenge': challenge.to_dict(current_user_id=user_id), 'board': board})


# ─── Парные стрики ─────────────────────────────────────────────────────────────

@challenges_bp.route('/groups/<int:group_id>/pair-streaks', methods=['GET'])
@jwt_required()
def list_pair_streaks(group_id):
    """Все pair streaks текущего пользователя в группе (активные + ожидающие)."""
    user_id = int(get_jwt_identity())
    if not _check_group_member(group_id, user_id):
        return jsonify({'error': 'Нет доступа к группе'}), 403

    streaks = PairStreak.query.filter(
        PairStreak.group_id == group_id,
        (PairStreak.user1_id == user_id) | (PairStreak.user2_id == user_id),
    ).all()

    return jsonify([s.to_dict(viewer_id=user_id) for s in streaks])


@challenges_bp.route('/groups/<int:group_id>/pair-streaks/<int:partner_id>', methods=['GET'])
@jwt_required()
def get_pair_streak(group_id, partner_id):
    """Стрик текущего пользователя с конкретным участником."""
    user_id = int(get_jwt_identity())
    if not _check_group_member(group_id, user_id):
        return jsonify({'error': 'Нет доступа к группе'}), 403

    streak = PairStreak.query.filter(
        PairStreak.group_id == group_id,
        (
            ((PairStreak.user1_id == user_id) & (PairStreak.user2_id == partner_id)) |
            ((PairStreak.user1_id == partner_id) & (PairStreak.user2_id == user_id))
        )
    ).first()

    if not streak:
        return jsonify({'streak': None})

    # Дополнительно: залогировал ли каждый из пары сегодня
    today = date.today()
    my_logged = Meal.query.filter_by(user_id=user_id, meal_date=today).first() is not None
    partner_logged = Meal.query.filter_by(user_id=partner_id, meal_date=today).first() is not None

    data = streak.to_dict(viewer_id=user_id)

    if streak.status == 'active':
        data['myLoggedToday'] = my_logged
        data['partnerLoggedToday'] = partner_logged
    else:
        data['myLoggedToday'] = False
        data['partnerLoggedToday'] = False

    return jsonify({'streak': data})


@challenges_bp.route('/groups/<int:group_id>/pair-streaks/<int:partner_id>/start', methods=['POST'])
@jwt_required()
def start_pair_streak(group_id, partner_id):
    """Предложить парный стрик участнику группы (создаёт запись со статусом 'pending')."""
    user_id = int(get_jwt_identity())
    if not _check_group_member(group_id, user_id):
        return jsonify({'error': 'Нет доступа к группе'}), 403
    if not _check_group_member(group_id, partner_id):
        return jsonify({'error': 'Партнёр не состоит в группе'}), 400
    if user_id == partner_id:
        return jsonify({'error': 'Нельзя начать стрик с самим собой'}), 400

    # Нормализуем порядок user1 < user2 для уникальности
    u1, u2 = sorted([user_id, partner_id])

    existing = PairStreak.query.filter_by(user1_id=u1, user2_id=u2, group_id=group_id).first()
    if existing:
        # Если invited_by_id не был записан (старые строки) — самовосстановление
        if existing.invited_by_id is None and existing.status == 'pending':
            existing.invited_by_id = user_id
            db.session.commit()
        return jsonify({'streak': existing.to_dict(viewer_id=user_id)})

    streak = PairStreak(
        user1_id=u1,
        user2_id=u2,
        group_id=group_id,
        status='pending',
        invited_by_id=user_id,
    )
    db.session.add(streak)
    db.session.commit()

    return jsonify({'streak': streak.to_dict(viewer_id=user_id)}), 201


@challenges_bp.route('/groups/<int:group_id>/pair-streaks/<int:partner_id>/accept', methods=['POST'])
@jwt_required()
def accept_pair_streak(group_id, partner_id):
    """Принять приглашение к парному стрику."""
    user_id = int(get_jwt_identity())
    if not _check_group_member(group_id, user_id):
        return jsonify({'error': 'Нет доступа к группе'}), 403

    u1, u2 = sorted([user_id, partner_id])
    streak = PairStreak.query.filter_by(user1_id=u1, user2_id=u2, group_id=group_id).first()

    if not streak:
        return jsonify({'error': 'Приглашение не найдено'}), 404
    if streak.invited_by_id == user_id:
        return jsonify({'error': 'Нельзя принять своё собственное приглашение'}), 400
    if streak.status == 'active':
        return jsonify({'streak': streak.to_dict(viewer_id=user_id)})

    streak.status = 'active'
    db.session.commit()

    return jsonify({'streak': streak.to_dict(viewer_id=user_id)})


@challenges_bp.route('/groups/<int:group_id>/pair-streaks/<int:partner_id>/reject', methods=['POST'])
@jwt_required()
def reject_pair_streak(group_id, partner_id):
    """Отклонить или отменить приглашение к парному стрику."""
    user_id = int(get_jwt_identity())
    if not _check_group_member(group_id, user_id):
        return jsonify({'error': 'Нет доступа к группе'}), 403

    u1, u2 = sorted([user_id, partner_id])
    streak = PairStreak.query.filter_by(user1_id=u1, user2_id=u2, group_id=group_id).first()

    if not streak:
        return jsonify({'message': 'Уже удалено'})

    db.session.delete(streak)
    db.session.commit()

    return jsonify({'message': 'Приглашение отклонено'})
