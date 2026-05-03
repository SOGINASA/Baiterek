# Baiterek Portal — Backend API

Серверная часть Единого портала поддержки бизнеса (АО «Байтерек»).
Flask + SQLAlchemy + JWT, модульная архитектура с blueprints, JSON-валидация
форм заявок, журнал аудита, заглушки интеграций ЕИШ и ЭЦП.

## Стек

- Flask 3, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Migrate
- Marshmallow (валидация входа), Flask-Marshmallow
- SQLite (dev) / PostgreSQL (prod)
- pytest + pytest-flask

## Запуск (dev)

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt

copy .env.example .env           # настройте при необходимости
python wsgi.py                   # порт 1489
```

В DEBUG-режиме таблицы создаются автоматически и БД сидится базовыми
данными (7 дочерних организаций, 7 категорий, 5 услуг, статьи, FAQ, шаблоны).

## Миграции

```bash
set FLASK_APP=wsgi.py
flask db init             # один раз — создание migrations/
flask db migrate -m "init"
flask db upgrade
flask seed                # засеять справочники
```

## Тесты

```bash
pytest
```

## Структура

```
backend/
├── app/
│   ├── __init__.py            # фабрика create_app
│   ├── extensions.py          # db, jwt, migrate, cors, ma
│   ├── errors.py              # ApiError + глобальные обработчики
│   ├── decorators.py          # require_user / require_roles
│   ├── pagination.py
│   ├── logging_config.py      # JSON-логирование
│   ├── seeder.py
│   ├── models/                # доменные модели
│   ├── schemas/               # Marshmallow-схемы
│   ├── services/              # form_validator, notifier, audit
│   ├── integrations/          # eish, ecp (заглушки)
│   ├── blueprints/
│   │   ├── auth.py            #  /api/auth (register, login, refresh, profile)
│   │   ├── services.py        #  /api/services (+ form schema)
│   │   ├── applications.py    #  /api/applications (CRUD, submit, cancel, history)
│   │   ├── documents.py       #  upload, версии, comments, review, sign
│   │   ├── notifications.py   #  /api/notifications
│   │   ├── subsidiaries.py    #  /api/subsidiaries (+ services/news/contacts/pages/faq)
│   │   ├── categories.py      #  /api/categories
│   │   ├── articles.py        #  /api/articles
│   │   ├── pages.py           #  CMS-страницы
│   │   ├── faq.py             #  /api/faq
│   │   ├── templates.py       #  /api/templates
│   │   ├── news.py            #  /api/news
│   │   ├── contacts.py        #  /api/contacts
│   │   ├── vacancies.py       #  /api/vacancies
│   │   ├── search.py          #  /api/search (по services/articles/news/pages/faq)
│   │   ├── calculators.py     #  /api/calculators/loan, /api/calculators/budget
│   │   ├── bookings.py        #  онлайн-бронирование
│   │   ├── webhooks.py        #  /api/webhooks/eish/application_status
│   │   └── health.py          #  /api/health, /api/health/ready
│   └── utils/file_handler.py
├── tests/
├── config.py
├── wsgi.py
└── requirements.txt
```

## Основные эндпоинты

### Аутентификация
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `POST /api/auth/refresh` — обновление access-токена
- `GET  /api/auth/profile` / `PUT /api/auth/profile`

### Услуги и каталог
- `GET /api/services?category=&type=&subsidiary=&q=&sort=&paginated=1`
- `GET /api/services/<slug>` — карточка услуги (включая form_schema)
- `GET /api/services/<slug>/form` — JSON-схема формы заявки
- `GET /api/categories[?with_children=1]`
- `GET /api/categories/<slug>/services`
- `GET /api/subsidiaries`, `/<slug>`, `/<slug>/{services,news,contacts,pages,faq,articles}`

### Заявки и документы
- `POST /api/applications` — создать черновик
- `PUT  /api/applications/<id>` — обновить (только в draft / awaiting_documents)
- `POST /api/applications/<id>/submit` — отправить (валидация по FormSchema +
  передача в ЕИШ-stub, возвращает external_id)
- `POST /api/applications/<id>/cancel`
- `GET  /api/applications/<id>/status` — история статусов
- `POST /api/applications/<id>/documents` — загрузка документа (multipart/form-data)
- `POST /api/documents/<id>/versions` — новая версия
- `POST /api/documents/<id>/comments` — комментарий
- `GET  /api/documents/<id>/comments`
- `POST /api/documents/<id>/review` — `{decision: approve|reject|revise}`
- `POST /api/documents/<id>/sign` — подпись ЭЦП (NCALayer-stub)
- `GET  /api/documents/<id>/download`

### Контент
- `GET /api/articles[?category=&subsidiary=&q=]`, `/<slug>`
- `GET /api/news[?subsidiary=&type=&q=]`, `/<slug>`
- `GET /api/pages?section=corporate&subsidiary=damu`, `/<slug>`
- `GET /api/faq[?category=&subsidiary=]`
- `GET /api/templates[?category=&subsidiary=&service_id=]`
- `GET /api/contacts[?subsidiary=&city=]`
- `GET /api/vacancies`

### Поиск и инструменты
- `GET /api/search?q=...&types=service,article,news,page,faq,subsidiary`
- `POST /api/calculators/loan` — аннуитетный расчёт
- `POST /api/calculators/budget` — авто-смета по позициям

### Уведомления и бронирование
- `GET /api/notifications[?unread=1]`
- `GET /api/notifications/unread_count`
- `PUT /api/notifications/<id>/read`, `/api/notifications/read_all`
- `GET/POST /api/bookings`, `POST /api/bookings/<id>/cancel`

### Webhooks (ЕИШ)
- `POST /api/webhooks/eish/application_status`
  Заголовок: `X-EISH-Token: <EISH_API_KEY>`
  Тело: `{external_id, status, external_status?, comment?}`

## Формат ошибок

Единый JSON для всех 4xx/5xx:
```json
{ "error": "Сообщение", "code": "validation_error", "details": { ... } }
```

## Аудит и журнал интеграций

- Каждое мутирующее действие пишется в `audit_logs` (action, user_id, IP, UA).
- Каждый вызов внешней системы — в `integration_logs` (request/response,
  длительность, success/error, related_resource).

## Безопасность (соответствие ТЗ)

- JWT (access + refresh)
- Серверная валидация формы по JSON-схеме (FormSchema)
- Запрет редактирования заявок после отправки
- Запрет удаления подписанных документов
- Журнал аудита всех действий
- Webhook-callback от ЕИШ требует токен в заголовке

## Что осталось за пределами этих 4 фаз

- Кабинет администратора (Phase 6)
- Реальная интеграция eGov IDP / NCALayer / Bitrix / CRM (Phase 8)
- Аналитика и отчёты (Phase 8)
- PII-шифрование и rate limiting (Phase 9)
- MinIO/S3 для документов (Phase 9)
- Celery для асинхронных задач (Phase 7)
