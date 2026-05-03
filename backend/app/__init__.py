import os
import logging

from flask import Flask

from config import get_config, _normalize_db_uri
from .extensions import db, migrate, jwt, cors, ma
from .errors import register_error_handlers
from .logging_config import configure_logging

log = logging.getLogger(__name__)


def _ensure_sqlite_dir(uri):
    """Создать родительскую папку для SQLite-файла, если её нет."""
    if not uri or ':memory:' in uri or not uri.startswith('sqlite:///'):
        return
    path = uri[len('sqlite:///'):]
    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, exist_ok=True)


def create_app(config_class=None):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class or get_config())

    # Перенормализуем URI на случай, если кто-то переопределил его извне
    app.config['SQLALCHEMY_DATABASE_URI'] = _normalize_db_uri(
        app.config.get('SQLALCHEMY_DATABASE_URI')
    )

    configure_logging(app)
    log.info('DB URI: %s', app.config['SQLALCHEMY_DATABASE_URI'])

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    _ensure_sqlite_dir(app.config['SQLALCHEMY_DATABASE_URI'])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r'/api/*': {'origins': app.config['CORS_ORIGINS']}},
                  supports_credentials=True)

    # JWT configuration for PyJWT 2.x compatibility (identity must be string)
    @jwt.user_identity_loader
    def user_identity_lookup(identity):
        """Convert user identity to string for PyJWT 2.x compatibility."""
        if hasattr(identity, "id"):
            return str(identity.id)
        return str(identity)

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """Load user from JWT."""
        from .models.user import User
        identity = jwt_data.get("sub")
        # Identity is now string, convert to int for query
        if identity:
            try:
                return User.query.get(int(identity))
            except (ValueError, TypeError):
                return None
        return None

    # Импорт моделей нужен, чтобы create_all/Alembic их видел
    from . import models  # noqa: F401

    from .blueprints import register_blueprints
    register_blueprints(app)

    register_error_handlers(app)

    @app.cli.command('seed')
    def seed_command():
        """Заполнить БД базовыми данными."""
        from .seeder import run_seed
        run_seed()
        log.info('Seed выполнен')

    @app.cli.command('init-db')
    def init_db_command():
        """Создать таблицы и засеять данные (для dev без миграций)."""
        with app.app_context():
            db.create_all()
            from .seeder import run_seed
            run_seed()
        log.info('БД инициализирована')

    # В dev/testing создаём таблицы автоматически и сидим
    if app.config.get('TESTING') or app.config.get('DEBUG'):
        with app.app_context():
            try:
                db.create_all()
                log.info('[OK] Database tables created successfully')

                # Log table counts
                from .models.subsidiary import Subsidiary
                from .models.category import Category
                from .models.service import Service
                from .models.content import Article, News

                log.info('  Subsidiary: %d records', Subsidiary.query.count())
                log.info('  Category: %d records', Category.query.count())
                log.info('  Service: %d records', Service.query.count())
                log.info('  Article: %d records', Article.query.count())
                log.info('  News: %d records', News.query.count())
            except Exception:
                log.exception('db.create_all failed')
                raise
            try:
                from .seeder import run_seed
                run_seed()
                log.info('[OK] Database seeded successfully')
            except Exception as exc:
                log.warning('Seed skipped: %s', exc)

    return app
