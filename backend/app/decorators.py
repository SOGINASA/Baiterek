from functools import wraps

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from .errors import ForbiddenError, UnauthorizedError
from .models.user import User


def get_current_user():
    user_id = get_jwt_identity()
    if user_id is None:
        return None
    return User.query.get(user_id)


def require_user(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        if not user:
            raise UnauthorizedError('Пользователь не найден')
        if not user.is_active:
            raise ForbiddenError('Аккаунт заблокирован')
        return fn(user, *args, **kwargs)
    return wrapper


def require_roles(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            if not user:
                raise UnauthorizedError('Пользователь не найден')
            if user.user_type not in roles and user.user_type != 'admin':
                raise ForbiddenError('Недостаточно прав')
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator
