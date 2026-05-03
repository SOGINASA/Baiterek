from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

from ..extensions import db
from ..models.user import User
from ..errors import ConflictError, UnauthorizedError, NotFoundError, ForbiddenError
from ..schemas.auth import RegisterSchema, LoginSchema, ProfileUpdateSchema
from ..services.audit import audit
from ..decorators import require_user

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.post('/register')
def register():
    data = RegisterSchema().load(request.get_json() or {})

    if User.query.filter_by(email=data['email']).first():
        raise ConflictError('Пользователь с таким email уже существует', code='email_exists')

    if data.get('iin_number') and User.query.filter_by(iin_number=data['iin_number']).first():
        raise ConflictError('Пользователь с таким ИИН уже существует', code='iin_exists')

    user = User(
        email=data['email'],
        full_name=data.get('full_name', ''),
        phone=data.get('phone'),
        iin_number=data.get('iin_number'),
        bin_number=data.get('bin_number'),
        organization_name=data.get('organization_name'),
        position=data.get('position'),
        is_verified=True,
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    audit('user.register', resource_type='user', resource_id=user.id, user_id=user.id)
    db.session.commit()

    return jsonify({
        'user': user.to_dict(include_sensitive=True),
        'access_token': create_access_token(identity=user.id),
        'refresh_token': create_refresh_token(identity=user.id),
    }), 201


@bp.post('/login')
def login():
    data = LoginSchema().load(request.get_json() or {})

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        audit('user.login', result='failure', payload={'email': data['email']})
        db.session.commit()
        raise UnauthorizedError('Неверные данные для входа', code='invalid_credentials')

    if not user.is_active:
        raise ForbiddenError('Аккаунт заблокирован', code='account_blocked')

    audit('user.login', user_id=user.id, resource_type='user', resource_id=user.id)
    db.session.commit()

    return jsonify({
        'user': user.to_dict(include_sensitive=True),
        'access_token': create_access_token(identity=user.id),
        'refresh_token': create_refresh_token(identity=user.id),
    }), 200


@bp.post('/refresh')
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        raise UnauthorizedError('Сессия недействительна')
    return jsonify({'access_token': create_access_token(identity=user_id)}), 200


@bp.get('/profile')
@require_user
def profile(user):
    return jsonify(user.to_dict(include_sensitive=True)), 200


@bp.put('/profile')
@require_user
def update_profile(user):
    data = ProfileUpdateSchema().load(request.get_json() or {}, partial=True)
    for key, value in data.items():
        setattr(user, key, value)
    db.session.commit()
    audit('user.profile_update', user_id=user.id, resource_type='user', resource_id=user.id)
    db.session.commit()
    return jsonify(user.to_dict(include_sensitive=True)), 200
