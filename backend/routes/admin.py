from functools import wraps
from datetime import timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt
from sqlalchemy import text

from models import db, Feedback

admin_bp = Blueprint('admin', __name__)


def admin_required(fn):
    """Декоратор — проверяет что запрос содержит валидный admin JWT."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Требуются права администратора'}), 403
        return fn(*args, **kwargs)
    return wrapper


def _ensure_is_read_column():
    """Добавить колонку is_read в feedbacks если её нет (для существующих БД)."""
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE feedbacks ADD COLUMN is_read BOOLEAN DEFAULT 0"))
            conn.commit()
    except Exception:
        pass  # Колонка уже существует


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Вход в панель администратора."""
    from config import Config

    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Введите логин и пароль'}), 400

    if username != Config.ADMIN_USERNAME or password != Config.ADMIN_PASSWORD:
        return jsonify({'error': 'Неверный логин или пароль'}), 401

    token = create_access_token(
        identity='admin',
        additional_claims={'role': 'admin'},
        expires_delta=timedelta(hours=12),
    )

    return jsonify({
        'token': token,
        'username': username,
    }), 200


@admin_bp.route('/feedbacks', methods=['GET'])
@admin_required
def get_feedbacks():
    """Получить список всех обращений с пагинацией и фильтрами."""
    _ensure_is_read_column()

    category = request.args.get('category')   # bug | feature | improvement | other
    is_read = request.args.get('is_read')      # true | false
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    query = Feedback.query.order_by(Feedback.created_at.desc())

    if category and category in ('bug', 'feature', 'improvement', 'other'):
        query = query.filter(Feedback.category == category)

    if is_read is not None:
        flag = is_read.lower() == 'true'
        query = query.filter(Feedback.is_read == flag)

    total = query.count()
    feedbacks = query.offset((page - 1) * per_page).limit(per_page).all()

    # Статистика
    total_all = Feedback.query.count()
    unread = Feedback.query.filter_by(is_read=False).count()
    by_category = {
        'bug': Feedback.query.filter_by(category='bug').count(),
        'feature': Feedback.query.filter_by(category='feature').count(),
        'improvement': Feedback.query.filter_by(category='improvement').count(),
        'other': Feedback.query.filter_by(category='other').count(),
    }

    return jsonify({
        'feedbacks': [f.to_dict(include_user=True) for f in feedbacks],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
        },
        'stats': {
            'total': total_all,
            'unread': unread,
            'by_category': by_category,
        },
    }), 200


@admin_bp.route('/feedbacks/<int:feedback_id>/read', methods=['PATCH'])
@admin_required
def mark_read(feedback_id):
    """Отметить обращение как прочитанное/непрочитанное."""
    feedback = Feedback.query.get_or_404(feedback_id)
    data = request.get_json() or {}
    feedback.is_read = data.get('is_read', True)
    db.session.commit()
    return jsonify({'success': True, 'isRead': feedback.is_read}), 200


@admin_bp.route('/feedbacks/<int:feedback_id>', methods=['DELETE'])
@admin_required
def delete_feedback(feedback_id):
    """Удалить обращение."""
    feedback = Feedback.query.get_or_404(feedback_id)
    db.session.delete(feedback)
    db.session.commit()
    return jsonify({'success': True}), 200


@admin_bp.route('/verify', methods=['GET'])
@admin_required
def verify_token():
    """Проверить валидность токена."""
    return jsonify({'valid': True}), 200
