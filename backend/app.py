import os
import json
from datetime import timedelta

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv

from config import Config
from models import db, User, Service, Application, Notification, News, Article

# Загружаем переменные окружения
load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # CORS для фронтенда
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ])
    
    # Инициализация расширений
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Создаём папку для БД
    os.makedirs('database', exist_ok=True)
    
    with app.app_context():
        db.create_all()
        _seed_data()
    
    # ========== AUTH ENDPOINTS ==========
    
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email и пароль обязательны'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Пользователь с таким email уже существует'}), 400
        
        user = User(
            email=data['email'],
            full_name=data.get('full_name', ''),
            bin_number=data.get('bin_number'),
            is_verified=True
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'user': user.to_dict(include_sensitive=True),
            'access_token': access_token
        }), 201
    
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email и пароль обязательны'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Неверные данные для входа'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Аккаунт заблокирован'}), 403
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'user': user.to_dict(include_sensitive=True),
            'access_token': access_token
        }), 200
    
    
    @app.route('/api/auth/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        return jsonify(user.to_dict(include_sensitive=True)), 200
    
    
    # ========== SERVICES ENDPOINTS ==========
    
    @app.route('/api/services', methods=['GET'])
    def get_services():
        """Получить список всех сервисов с фильтрацией"""
        category = request.args.get('category')
        type_ = request.args.get('type')
        query = request.args.get('query', '').lower()
        
        services = Service.query
        
        if category:
            services = services.filter_by(category=category)
        
        if type_:
            services = services.filter_by(type=type_)
        
        if query:
            # Поиск по названию и тегам
            services_list = services.all()
            filtered = []
            for s in services_list:
                if query in s.title.lower() or query in s.description.lower():
                    filtered.append(s)
                else:
                    tags = json.loads(s.tags) if s.tags else []
                    if any(query in tag.lower() for tag in tags):
                        filtered.append(s)
            services_data = [s.to_dict() for s in filtered]
        else:
            services_data = [s.to_dict() for s in services.all()]
        
        return jsonify(services_data), 200
    
    
    @app.route('/api/services/<slug>', methods=['GET'])
    def get_service(slug):
        """Получить отдельный сервис по slug"""
        service = Service.query.filter_by(slug=slug).first()
        
        if not service:
            return jsonify({'error': 'Сервис не найден'}), 404
        
        return jsonify(service.to_dict()), 200
    
    
    # ========== NEWS ENDPOINTS ==========
    
    @app.route('/api/news', methods=['GET'])
    def get_news():
        """Получить новости"""
        news = News.query.order_by(News.published_at.desc()).all()
        return jsonify([n.to_dict() for n in news]), 200
    
    
    @app.route('/api/news/<slug>', methods=['GET'])
    def get_news_article(slug):
        """Получить отдельную новость"""
        news = News.query.filter_by(slug=slug).first()
        
        if not news:
            return jsonify({'error': 'Новость не найдена'}), 404
        
        return jsonify(news.to_dict()), 200
    
    
    # ========== APPLICATIONS ENDPOINTS ==========
    
    @app.route('/api/applications', methods=['GET'])
    @jwt_required()
    def get_user_applications():
        """Получить заявки пользователя"""
        user_id = get_jwt_identity()
        applications = Application.query.filter_by(user_id=user_id).all()
        return jsonify([a.to_dict() for a in applications]), 200
    
    
    @app.route('/api/applications', methods=['POST'])
    @jwt_required()
    def create_application():
        """Создать новую заявку"""
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('service_id'):
            return jsonify({'error': 'service_id обязателен'}), 400
        
        service = Service.query.get(data['service_id'])
        if not service:
            return jsonify({'error': 'Сервис не найден'}), 404
        
        app = Application(
            user_id=user_id,
            service_id=data['service_id'],
            form_data=json.dumps(data.get('form_data', {})),
            status='draft'
        )
        
        db.session.add(app)
        db.session.commit()
        
        return jsonify(app.to_dict()), 201
    
    
    @app.route('/api/applications/<int:app_id>', methods=['GET'])
    @jwt_required()
    def get_application(app_id):
        """Получить заявку"""
        user_id = get_jwt_identity()
        application = Application.query.get(app_id)
        
        if not application or application.user_id != user_id:
            return jsonify({'error': 'Заявка не найдена'}), 404
        
        return jsonify(application.to_dict()), 200
    
    
    @app.route('/api/applications/<int:app_id>', methods=['PUT'])
    @jwt_required()
    def update_application(app_id):
        """Обновить заявку"""
        user_id = get_jwt_identity()
        data = request.get_json()
        
        application = Application.query.get(app_id)
        if not application or application.user_id != user_id:
            return jsonify({'error': 'Заявка не найдена'}), 404
        
        if 'form_data' in data:
            application.form_data = json.dumps(data['form_data'])
        
        if 'status' in data:
            application.status = data['status']
        
        db.session.commit()
        
        return jsonify(application.to_dict()), 200
    
    
    @app.route('/api/applications/<int:app_id>/submit', methods=['POST'])
    @jwt_required()
    def submit_application(app_id):
        """Отправить заявку"""
        from datetime import datetime, timezone
        user_id = get_jwt_identity()
        
        application = Application.query.get(app_id)
        if not application or application.user_id != user_id:
            return jsonify({'error': 'Заявка не найдена'}), 404
        
        application.status = 'submitted'
        application.submitted_at = datetime.now(timezone.utc)
        
        # Создаём уведомление
        notification = Notification(
            user_id=user_id,
            title='Заявка отправлена',
            message=f'Ваша заявка на услугу успешно отправлена и находится в обработке',
            type='application_status',
            related_application_id=app_id
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify(application.to_dict()), 200
    
    
    # ========== NOTIFICATIONS ENDPOINTS ==========
    
    @app.route('/api/notifications', methods=['GET'])
    @jwt_required()
    def get_notifications():
        """Получить уведомления пользователя"""
        user_id = get_jwt_identity()
        notifications = Notification.query.filter_by(user_id=user_id).order_by(
            Notification.created_at.desc()
        ).all()
        return jsonify([n.to_dict() for n in notifications]), 200
    
    
    @app.route('/api/notifications/<int:notif_id>/read', methods=['PUT'])
    @jwt_required()
    def mark_notification_read(notif_id):
        """Отметить уведомление как прочитанное"""
        from datetime import datetime, timezone
        user_id = get_jwt_identity()
        
        notification = Notification.query.get(notif_id)
        if not notification or notification.user_id != user_id:
            return jsonify({'error': 'Уведомление не найдено'}), 404
        
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify(notification.to_dict()), 200
    
    
    # ========== HEALTH CHECK ==========
    
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'message': 'Baiterek Portal API'}), 200
    
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Не найдено'}), 404
    
    
    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500
    
    
    return app


def _seed_data():
    """Заполнить БД тестовыми данными"""
    
    # Проверяем, есть ли уже данные
    if Service.query.first() is not None:
        return
    
    # MOCK SERVICES
    services_data = [
        {
            'id': 'damu-micro-loan', 'slug': 'damu-micro-loan',
            'title': 'Микрокредитование МСБ', 'subtitle': 'До 30 млн тенге на пополнение оборотных средств',
            'category': 'financing', 'type': 'loan', 'subsidiary_id': 'damu',
            'tags': json.dumps(['МСБ', 'Оборотные средства', 'Льготная ставка']),
            'amount_min': 1_000_000, 'amount_max': 30_000_000,
            'rate': '6% годовых', 'term': 'до 36 мес.',
            'is_popular': True,
            'description': 'Льготное микрокредитование для субъектов малого и среднего бизнеса Казахстана на развитие производства и пополнение оборотных средств.',
            'conditions': json.dumps(['Срок деятельности — не менее 6 месяцев', 'Расчётный счёт в РК', 'Отсутствие задолженности по налогам']),
            'documents': json.dumps(['Заявление установленной формы', 'Свидетельство о регистрации (БИН)', 'Финансовая отчётность за 2 года', 'Бизнес-план']),
            'timeline': '7–15 рабочих дней',
        },
        {
            'id': 'damu-guarantee', 'slug': 'damu-guarantee',
            'title': 'Государственная гарантия по кредиту', 'subtitle': 'Гарантия до 85% от суммы кредита',
            'category': 'guarantees', 'type': 'guarantee', 'subsidiary_id': 'damu',
            'tags': json.dumps(['Гарантия', 'МСБ', 'Банки']),
            'amount_min': 5_000_000, 'amount_max': 500_000_000,
            'rate': '0.5% комиссия', 'term': 'до 84 мес.',
            'is_popular': True,
            'description': 'Государственная гарантия позволяет получить кредит в банке-партнёре при отсутствии достаточного залогового обеспечения.',
            'conditions': json.dumps(['Резидент РК', 'МСБ по критериям законодательства', 'Кредитование в банке-партнёре Даму']),
            'documents': json.dumps(['Заявка в банк-партнёр', 'Финансовая отчётость', 'Учредительные документы']),
            'timeline': '10–20 рабочих дней',
        },
        {
            'id': 'kaznex-export-insurance', 'slug': 'kaznex-export-insurance',
            'title': 'Страхование экспортных кредитов', 'subtitle': 'Защита от коммерческих и политических рисков',
            'category': 'export', 'type': 'guarantee', 'subsidiary_id': 'kaznex',
            'tags': json.dumps(['Экспорт', 'Страхование', 'Риски']),
            'amount_min': 10_000_000, 'amount_max': 5_000_000_000,
            'rate': 'от 0.3% годовых', 'term': 'до 5 лет',
            'is_popular': True,
            'description': 'Страхование экспортных сделок от риска неоплаты иностранным покупателем и политических рисков в стране покупателя.',
            'conditions': json.dumps(['Экспортёр — резидент РК', 'Экспорт несырьевых товаров', 'Контракт с иностранным покупателем']),
            'documents': json.dumps(['Экспортный контракт', 'Заявление на страхование', 'Финансовая отчётность экспортёра']),
            'timeline': '15–30 рабочих дней',
        },
        {
            'id': 'kzh-leasing', 'slug': 'kzh-leasing',
            'title': 'Финансовый лизинг оборудования', 'subtitle': 'Приобретение оборудования без крупных единовременных затрат',
            'category': 'leasing', 'type': 'leasing', 'subsidiary_id': 'kzh',
            'tags': json.dumps(['Лизинг', 'Оборудование', 'Производство']),
            'amount_min': 5_000_000, 'amount_max': 2_000_000_000,
            'rate': '7% годовых', 'term': 'до 84 мес.',
            'is_popular': False,
            'description': 'Финансовый лизинг позволяет приобрести производственное оборудование с постепенной оплатой без изъятия оборотных средств.',
            'conditions': json.dumps(['Деятельность не менее 1 года', 'Оборудование — новое или б/у до 5 лет', 'Аванс от 15%']),
            'documents': json.dumps(['Заявка на лизинг', 'Финансовая отчётность', 'Счёт-фактура на оборудование']),
            'timeline': '10–15 рабочих дней',
        },
        {
            'id': 'damu-grant', 'slug': 'damu-grant',
            'title': 'Грант для начинающих предпринимателей', 'subtitle': 'Безвозвратная субсидия до 5 млн тенге',
            'category': 'grants', 'type': 'grant', 'subsidiary_id': 'damu',
            'tags': json.dumps(['Грант', 'Начинающие', 'Безвозвратно']),
            'amount_min': 0, 'amount_max': 5_000_000,
            'rate': 'Безвозвратно', 'term': 'Единоразово',
            'is_popular': True,
            'description': 'Безвозвратная государственная субсидия для открытия или развития малого бизнеса в первые два года деятельности.',
            'conditions': json.dumps(['Возраст до 35 лет ИЛИ деятельность до 2 лет', 'Прохождение обучения «Бастау Бизнес»', 'Бизнес-проект прошёл отбор']),
            'documents': json.dumps(['Заявление', 'Бизнес-план', 'Сертификат о прохождении обучения', 'Удостоверение личности']),
            'timeline': '20–30 рабочих дней',
        },
    ]
    
    for svc_data in services_data:
        service = Service(**svc_data)
        db.session.add(service)
    
    # MOCK NEWS
    news_data = [
        {
            'id': 'news-001', 'slug': 'baiterek-2025-strategy',
            'title': 'Байтерек объявляет новую стратегию 2025',
            'subtitle': 'Расширение программ поддержки МСБ и стартапов',
            'content': 'В 2025 году холдинг увеличит объёмы финансирования инновационных проектов на 40% и откроет 15 новых консультационных центров.',
            'subsidiary_id': None,
        },
        {
            'id': 'news-002', 'slug': 'damu-new-program',
            'title': 'Даму запускает программу микрокредитования стартапов',
            'subtitle': 'Специальные условия для инновационных компаний',
            'content': 'С марта 2025 года Даму предоставляет микрокредиты до 50 млн тенге для технологических стартапов по ставке 0%.',
            'subsidiary_id': 'damu',
        },
    ]
    
    for news_item in news_data:
        news = News(**news_item)
        db.session.add(news)
    
    db.session.commit()


if __name__ == '__main__':
    app = create_app()
    app.run(debug=False, host='0.0.0.0', port=1489)
