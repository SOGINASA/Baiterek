# FoodTrack Backend API

Серверная часть приложения для трекинга питания и анализа рациона с использованием Flask и SQLAlchemy.

## 📋 Содержание

- [Технологический стек](#технологический-стек)
- [Требования](#требования)
- [Установка](#установка)
- [Запуск приложения](#запуск-приложения)
- [Структура проекта](#структура-проекта)
- [API Endpoints](#api-endpoints)
- [Конфигурация](#конфигурация)
- [Переменные окружения](#переменные-окружения)
- [Docker](#docker)
- [Миграции БД](#миграции-бд)
- [Разработка](#разработка)

## 🛠 Технологический стек

- **Flask** - веб-фреймворк
- **SQLAlchemy** - ORM для работы с БД
- **Flask-SQLAlchemy** - интеграция SQLAlchemy с Flask
- **Flask-JWT-Extended** - аутентификация через JWT токены
- **Flask-CORS** - поддержка CORS запросов
- **Flask-Migrate** - миграции БД (Alembic)
- **SQLite/PostgreSQL** - база данных
- **Gunicorn** - WSGI HTTP сервер для продакшена

## 📦 Требования

- Python 3.11+
- pip (или poetry)
- (опционально) Docker и Docker Compose

## 🚀 Установка

### Локальная установка

1. Клонируйте репозиторий и перейдите в папку backend:
```bash
cd backend
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv

# Активируйте виртуальное окружение
# На Windows:
venv\Scripts\activate

# На macOS/Linux:
source venv/bin/activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Инициализируйте базу данных:
```bash
python
>>> from app import create_app
>>> app = create_app()
>>> with app.app_context():
>>>     from models import db
>>>     db.create_all()
>>> exit()
```

или используйте Flask-Migrate:
```bash
flask db upgrade
```

## ▶️ Запуск приложения

### Разработка

```bash
# С автоперезагрузкой при изменении файлов
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

Приложение будет доступно на `http://localhost:1489`

### Продакшен

```bash
gunicorn -w 4 -b 0.0.0.0:5252 app:app
```

## 📁 Структура проекта

```
backend/
├── app.py                  # Главный файл приложения
├── config.py              # Конфигурация (разработка, тестирование)
├── models.py              # ORM модели (User, Meal, Goals и т.д.)
├── seed_data.py           # Начальные данные для БД
├── requirements.txt       # Зависимости Python
├── Dockerfile             # Docker конфигурация
├── docker-compose.yml     # Docker Compose конфигурация
├── .gitignore            # Git ignore файл
├── database/             # Папка для БД и миграций
│   └── database.db       # SQLite БД (локально)
├── routes/               # API маршруты
│   ├── __init__.py
│   ├── auth.py          # Аутентификация и авторизация
│   ├── meals.py         # Управление приёмами пищи
│   ├── goals.py         # Цели и трекинг веса
│   ├── analytics.py     # Статистика и аналитика
│   ├── progress.py      # Прогресс пользователя
│   ├── groups.py        # Группы пользователей
│   └── meal_plans.py    # Планы питания
└── __pycache__/         # Кэш Python файлов
```

## 🔌 API Endpoints

### Аутентификация (`/api/auth`)

| Метод | Endpoint | Описание |
|-------|----------|---------|
| POST | `/register` | Регистрация нового пользователя |
| POST | `/login` | Вход в аккаунт |
| POST | `/refresh` | Обновление JWT токена |
| GET | `/profile` | Получение профиля пользователя |
| PUT | `/profile` | Обновление профиля |
| POST | `/logout` | Выход из аккаунта |

### Приёмы пищи (`/api/meals`)

| Метод | Endpoint | Описание |
|-------|----------|---------|
| POST | `/` | Добавить новый приём пищи |
| GET | `/` | Получить приёмы пищи за дату |
| GET | `/<id>` | Получить информацию о конкретном приёме |
| PUT | `/<id>` | Обновить приём пищи |
| DELETE | `/<id>` | Удалить приём пищи |
| GET | `/day/<date>` | Получить все приёмы за день |

### Цели (`/api/goals`)

| Метод | Endpoint | Описание |
|-------|----------|---------|
| GET | `/` | Получить текущие цели |
| POST | `/` | Создать новые цели |
| PUT | `/` | Обновить цели |
| POST | `/weight` | Добавить запись веса |
| GET | `/weight` | Получить историю веса |

### Аналитика (`/api/analytics`)

| Метод | Endpoint | Описание |
|-------|----------|---------|
| GET | `/daily/<date>` | Статистика за день |
| GET | `/weekly` | Статистика за неделю |
| GET | `/monthly` | Статистика за месяц |
| GET | `/nutrition/<date>` | Подробная информация о питательных веществах |

### Прогресс (`/api/progress`)

| Метод | Endpoint | Описание |
|-------|----------|---------|
| GET | `/` | Получить прогресс пользователя |
| GET | `/weight-chart` | График веса |
| GET | `/calories-chart` | График калорий |

### Группы (`/api/groups`)

| Метод | Endpoint | Описание |
|-------|----------|---------|
| POST | `/` | Создать новую группу |
| GET | `/` | Получить группы пользователя |
| POST | `/<id>/invite` | Пригласить пользователя |
| GET | `/<id>/members` | Получить членов группы |

### Планы питания (`/api/meal-plans`)

| Метод | Endpoint | Описание |
|-------|----------|---------|
| POST | `/` | Создать план питания |
| GET | `/` | Получить планы пользователя |
| PUT | `/<id>` | Обновить план |
| DELETE | `/<id>` | Удалить план |

## ⚙️ Конфигурация

Конфигурация хранится в файле `config.py` и разделена на несколько окружений:

- **DevelopmentConfig** - для разработки (DEBUG=True, SQLite)
- **TestingConfig** - для тестирования (in-memory БД)
- **Config** - базовая конфигурация

### Основные параметры

```python
SECRET_KEY              # Секретный ключ приложения
JWT_SECRET_KEY         # Ключ для подписания JWT
SQLALCHEMY_DATABASE_URI # URI подключения к БД
JWT_ACCESS_TOKEN_EXPIRES # Время жизни access token (24 часа)
JWT_REFRESH_TOKEN_EXPIRES # Время жизни refresh token (30 дней)
```

## 🔐 Переменные окружения

Создайте файл `.env` в корневой папке backend:

```env
# Flask
FLASK_APP=app.py
FLASK_ENV=development

# Безопасность
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# База данных (опционально, если не использовать SQLite)
DATABASE_URL=sqlite:///./database/database.db
# или для PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/foodtrack

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🐳 Docker

### Запуск с Docker Compose

```bash
docker-compose up -d
```

Сервис будет доступен на `http://localhost:5252`

### Запуск отдельного Docker контейнера

```bash
# Сборка образа
docker build -t foodtrack-backend .

# Запуск контейнера
docker run -p 5252:5252 \
  -e FLASK_ENV=production \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret-key \
  foodtrack-backend
```

### Docker Compose параметры

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5252:5252"
    environment:
      FLASK_ENV: production
      SECRET_KEY: your-secret-key
      JWT_SECRET_KEY: your-jwt-secret-key
    volumes:
      - ./database:/app/database
```

## 📊 Миграции БД

### Создание новой миграции

```bash
flask db migrate -m "Описание изменения"
```

### Применение миграций

```bash
flask db upgrade
```

### Откат миграции

```bash
flask db downgrade
```

### Просмотр истории миграций

```bash
flask db history
```

## 🧑‍💻 Разработка

### Структура моделей

Основные модели приложения:

- **User** - профиль пользователя с данными онбординга
- **Meal** - приёмы пищи (завтрак, обед, ужин, перекус)
- **UserGoals** - цели пользователя (калории, макросы, целевой вес)
- **WeightEntry** - записи веса для отслеживания прогресса
- **MealPlan** - плани питания
- **UserGroup** - группы для совместного трекинга

### Аутентификация

API использует JWT токены для аутентификации:

1. Пользователь отправляет email/password на `/api/auth/login`
2. Сервер возвращает `access_token` и `refresh_token`
3. Клиент отправляет токен в header: `Authorization: Bearer <token>`
4. Токен может быть обновлен через `/api/auth/refresh`

### Добавление нового маршрута

1. Создайте файл в папке `routes/` (например, `routes/new_feature.py`)
2. Используйте Blueprint:

```python
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

new_feature_bp = Blueprint('new_feature', __name__)

@new_feature_bp.route('/', methods=['GET'])
@jwt_required()
def get_data():
    user_id = get_jwt_identity()
    return jsonify({'message': 'Success'})
```

3. Зарегистрируйте blueprint в `app.py`:

```python
from routes.new_feature import new_feature_bp
app.register_blueprint(new_feature_bp, url_prefix='/api/new-feature')
```

### CORS

Список разрешенных источников указан в `config.py`:
- `http://localhost:3000` - локальная разработка React
- `http://localhost:5173` - Vite сервер
- `https://food-track-beta.vercel.app` - продакшен фронтенда

### Тестирование

```bash
# Запуск всех тестов
pytest

# С coverage
pytest --cov=routes

# Конкретный тест
pytest tests/test_auth.py::test_login
```

## 🐛 Логирование

Логирование настраивается в `config.py`. По умолчанию логи выводятся в консоль.

## 📝 Лучшие практики

1. **Валидация** - всегда валидируйте входные данные
2. **Обработка ошибок** - используйте правильные HTTP статусы
3. **JWT** - отправляйте токен в Authorization header
4. **CORS** - добавляйте новые источники в config.py
5. **БД** - используйте миграции для изменений схемы

## 🆘 Возможные проблемы

### БД заблокирована
```bash
# Удалите файл БД и создайте новую
rm database/database.db
flask db upgrade
```

### CORS ошибки
Проверьте, что фронтенд URL добавлен в `CORS_ORIGINS` в `config.py`

### JWT ошибки
- Проверьте что токен отправляется с `Bearer` префиксом
- Убедитесь что токен не истек (24 часа)
- Используйте `refresh` endpoint для обновления токена

## 📞 Контакты и поддержка

Для вопросов или проблем, пожалуйста, создайте Issue в репозитории.

## 📄 Лицензия

Проект распространяется под лицензией MIT.
