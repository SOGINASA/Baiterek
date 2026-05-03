"""Webhooks от внешних систем (через ЕИШ)."""
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app

from ..extensions import db
from ..errors import NotFoundError, UnauthorizedError
from ..models.application import Application, ApplicationStatusHistory
from ..schemas.application import ApplicationStatusCallbackSchema
from ..services.audit import audit
from ..services.notifier import notify
from ..integrations import eish

bp = Blueprint('webhooks', __name__, url_prefix='/api/webhooks')


def _check_token():
    expected = current_app.config.get('EISH_API_KEY')
    token = request.headers.get('X-EISH-Token')
    if expected and token != expected:
        raise UnauthorizedError('Неверный токен ЕИШ', code='bad_token')


@bp.post('/eish/application_status')
def application_status_callback():
    """Обработка callback от внешней BPM через ЕИШ."""
    _check_token()
    data = ApplicationStatusCallbackSchema().load(request.get_json() or {})

    application = Application.query.filter_by(external_id=data['external_id']).first()
    if not application:
        raise NotFoundError('Заявка не найдена')

    eish.record_inbound('application_status', data,
                        resource_type='application', resource_id=application.id)

    new_status = data['status']
    if application.status != new_status:
        db.session.add(ApplicationStatusHistory(
            application_id=application.id,
            from_status=application.status,
            to_status=new_status,
            comment=data.get('comment'),
            actor='eish',
        ))
        application.status = new_status

    if data.get('external_status'):
        application.external_status = data['external_status']

    if new_status in ('approved', 'rejected', 'completed'):
        application.completed_at = datetime.now(timezone.utc)

    notify(application.user_id, 'Статус заявки обновлён',
           f'Заявка №{application.id}: {new_status}',
           type='application_status',
           related_application_id=application.id,
           payload={'status': new_status, 'comment': data.get('comment')})

    audit('application.callback', actor_label='eish',
          resource_type='application', resource_id=application.id,
          payload=data)
    db.session.commit()
    return jsonify({'ok': True}), 200
