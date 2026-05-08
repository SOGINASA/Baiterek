import os
from datetime import timedelta

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_DIR = os.path.join(BACKEND_DIR, 'database')
UPLOAD_FOLDER = os.path.join(BACKEND_DIR, 'uploads')

DEFAULT_SQLITE_PATH = os.path.join(DATABASE_DIR, 'baiterek.db')


def _normalize_db_uri(uri):
    """Превращает относительные SQLite-URI в абсолютные относительно backend/.

    Flask-SQLAlchemy 3.x резолвит относительные sqlite-пути от app.instance_path,
    а не от CWD — это часто ломает локальный запуск. Здесь приводим всё к
    абсолютному виду и заодно поддерживаем формат `sqlite:///./database/...`.
    """
    if not uri:
        return uri

    if uri == 'sqlite:///:memory:' or uri.startswith('sqlite:///:memory:'):
        return uri

    if uri.startswith('sqlite:///'):
        path = uri[len('sqlite:///'):]
        # Windows-абсолют (C:/...) либо unix-абсолют (/...)
        is_windows_abs = len(path) >= 2 and path[1] == ':'
        is_unix_abs = path.startswith('/')
        if not (is_windows_abs or is_unix_abs):
            path = os.path.normpath(os.path.join(BACKEND_DIR, path))
            uri = 'sqlite:///' + path.replace('\\', '/')
    return uri


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'baiterek-dev-secret-key-2025')

    SQLALCHEMY_DATABASE_URI = _normalize_db_uri(
        os.environ.get('DATABASE_URL', f'sqlite:///{DEFAULT_SQLITE_PATH.replace(chr(92), "/")}')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
    }

    UPLOAD_FOLDER = UPLOAD_FOLDER
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32 MB

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'baiterek-jwt-secret-2025')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://baiterek-iota.vercel.app'
    ).split(',')

    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100

    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_JSON = os.environ.get('LOG_JSON', 'false').lower() == 'true'

    EISH_BASE_URL = os.environ.get('EISH_BASE_URL', 'http://localhost:9999/eish-mock')
    EISH_API_KEY = os.environ.get('EISH_API_KEY', 'dev-key')
    ECP_BASE_URL = os.environ.get('ECP_BASE_URL', 'http://localhost:9999/ecp-mock')


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    UPLOAD_FOLDER = os.path.join(BACKEND_DIR, 'tests', '_uploads')


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False


def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        return ProductionConfig
    if env == 'testing':
        return TestingConfig
    return DevelopmentConfig
