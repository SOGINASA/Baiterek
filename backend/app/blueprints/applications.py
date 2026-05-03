import json
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from ..extensions import db
from ..decorators import require_user
from ..errors import NotFoundError, ForbiddenError, ApiError
from ..models.application import Application, ApplicationStatusHistory
from ..models.service import Service
from ..pagination import paginate
from ..schemas.application import ApplicationCreateSchema, ApplicationUpdateSchema
from ..services.audit import audit
from ..services.form_validator import validate_form_data, FormValidationError
from ..services.notifier import notify
from ..integrations import eish

bp = Blueprint('applications', __name__, url_prefix='/api/applications')


def _ensure_owner(application, user):
    if not application or application.user_id != user.id:
        raise NotFoundError('Заявка не найдена')


def _change_status(application, new_status, comment=None, actor='user'):
    if application.status == new_status:
        return
    db.session.add(ApplicationStatusHistory(
        application_id=application.id,
        from_status=application.status,
        to_status=new_status,
        comment=comment,
        actor=actor,
    ))
    application.status = new_status


@bp.get('')
@require_user
def list_my_applications(user):
    q = Application.query.filter_by(user_id=user.id)

    status = request.args.get('status')
    if status:
        q = q.filter(Application.status == status)

    service_id = request.args.get('service_id')
    if service_id:
        q = q.filter(Application.service_id == service_id)

    q = q.order_by(Application.updated_at.desc())

    if request.args.get('paginated') in ('1', 'true'):
        return jsonify(paginate(q, lambda a: a.to_dict(with_documents=False))), 200
    return jsonify([a.to_dict(with_documents=False) for a in q.all()]), 200


@bp.post('')
@require_user
def create_application(user):
    data = ApplicationCreateSchema().load(request.get_json() or {})

    service = Service.query.get(data['service_id'])
    if not service:
        raise NotFoundError('Сервис не найден')

    application = Application(
        user_id=user.id,
        service_id=service.id,
        status='draft',
        form_data=json.dumps(data.get('form_data') or {}, ensure_ascii=False),
    )
    db.session.add(application)
    db.session.flush()

    db.session.add(ApplicationStatusHistory(
        application_id=application.id,
        from_status=None,
        to_status='draft',
        actor='user',
    ))

    audit('application.create', user_id=user.id,
          resource_type='application', resource_id=application.id)
    db.session.commit()

    return jsonify(application.to_dict()), 201


@bp.get('/<int:app_id>')
@require_user
def get_application(user, app_id):
    application = Application.query.get(app_id)
    _ensure_owner(application, user)
    return jsonify(application.to_dict()), 200


@bp.put('/<int:app_id>')
@require_user
def update_application(user, app_id):
    application = Application.query.get(app_id)
    _ensure_owner(application, user)

    if application.status not in ('draft', 'awaiting_documents'):
        raise ForbiddenError('Нельзя редактировать заявку в текущем статусе',
                             code='application_locked')

    data = ApplicationUpdateSchema().load(request.get_json() or {}, partial=True)

    if 'form_data' in data:
        application.form_data = json.dumps(data['form_data'], ensure_ascii=False)

    db.session.commit()
    audit('application.update', user_id=user.id,
          resource_type='application', resource_id=application.id)
    db.session.commit()
    return jsonify(application.to_dict()), 200


@bp.post('/<int:app_id>/submit')
@require_user
def submit_application(user, app_id):
    application = Application.query.get(app_id)
    _ensure_owner(application, user)

    if application.status not in ('draft', 'awaiting_documents'):
        raise ForbiddenError('Заявка уже отправлена', code='already_submitted')

    service = Service.query.get(application.service_id)
    schema = service.form_schema.get_schema() if service and service.form_schema else None

    try:
        validate_form_data(schema, application.get_form_data())
    except FormValidationError as exc:
        raise ApiError('Ошибка валидации формы заявки',
                       status_code=422, code='form_invalid', details=exc.errors)

    application.submitted_at = datetime.now(timezone.utc)
    _change_status(application, 'submitted', comment='Заявка отправлена', actor='user')

    # Передача в внешнюю BPM через ЕИШ (stub)
    try:
        external_id, _resp = eish.send_application(application)
        application.external_id = external_id
        application.external_status = 'in_review'
        _change_status(application, 'in_review', comment='Принята в обработку', actor='eish')
    except Exception as exc:
        audit('application.submit', result='failure', user_id=user.id,
              resource_type='application', resource_id=application.id,
              payload={'error': str(exc)})

    notify(user.id, 'Заявка отправлена',
           f'Заявка №{application.id} принята и передана в обработку.',
           type='application_status', related_application_id=application.id)

    audit('application.submit', user_id=user.id,
          resource_type='application', resource_id=application.id)
    db.session.commit()
    return jsonify(application.to_dict()), 200


@bp.post('/<int:app_id>/cancel')
@require_user
def cancel_application(user, app_id):
    application = Application.query.get(app_id)
    _ensure_owner(application, user)

    if application.status in ('approved', 'rejected', 'cancelled', 'completed'):
        raise ForbiddenError('Нельзя отменить заявку в текущем статусе')

    _change_status(application, 'cancelled', comment='Отменено пользователем', actor='user')
    notify(user.id, 'Заявка отменена',
           f'Заявка №{application.id} отменена.',
           type='application_status', related_application_id=application.id)

    audit('application.cancel', user_id=user.id,
          resource_type='application', resource_id=application.id)
    db.session.commit()
    return jsonify(application.to_dict()), 200


@bp.get('/<int:app_id>/status')
@require_user
def status_history(user, app_id):
    application = Application.query.get(app_id)
    _ensure_owner(application, user)
    history = [h.to_dict() for h in application.status_history.all()]
    return jsonify({
        'status': application.status,
        'external_status': application.external_status,
        'external_id': application.external_id,
        'history': history,
    }), 200
