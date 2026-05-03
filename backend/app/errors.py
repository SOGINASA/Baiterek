import logging

from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

from .extensions import db

log = logging.getLogger(__name__)


class ApiError(Exception):
    status_code = 400
    code = 'api_error'

    def __init__(self, message, status_code=None, code=None, details=None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code
        self.details = details

    def to_dict(self):
        body = {'error': self.message, 'code': self.code}
        if self.details is not None:
            body['details'] = self.details
        return body


class NotFoundError(ApiError):
    status_code = 404
    code = 'not_found'


class ForbiddenError(ApiError):
    status_code = 403
    code = 'forbidden'


class UnauthorizedError(ApiError):
    status_code = 401
    code = 'unauthorized'


class ConflictError(ApiError):
    status_code = 409
    code = 'conflict'


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err):
        return jsonify(err.to_dict()), err.status_code

    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        return jsonify({
            'error': 'Ошибка валидации данных',
            'code': 'validation_error',
            'details': err.messages,
        }), 422

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return jsonify({
            'error': err.description or err.name,
            'code': err.name.lower().replace(' ', '_'),
        }), err.code or 500

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        log.exception('Unhandled exception')
        try:
            db.session.rollback()
        except Exception:
            pass
        return jsonify({
            'error': 'Внутренняя ошибка сервера',
            'code': 'internal_error',
        }), 500
