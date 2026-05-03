"""Клиент Единой интеграционной шины (ЕИШ).

Сейчас — заглушка: генерирует внешний id, пишет в IntegrationLog и помечает
заявку как принятую внешней BPM. Реальная реализация подключается через
EISH_BASE_URL/EISH_API_KEY и заменит тело send_application.
"""
import json
import logging
import time
import uuid

from flask import current_app

from ..extensions import db
from ..models.integration import IntegrationLog

log = logging.getLogger(__name__)


def _log(operation, request_payload=None, response_payload=None,
         status_code=200, success=True, error=None, duration_ms=0,
         resource_type=None, resource_id=None, direction='out'):
    entry = IntegrationLog(
        integration='eish',
        direction=direction,
        operation=operation,
        request_payload=json.dumps(request_payload, ensure_ascii=False) if request_payload else None,
        response_payload=json.dumps(response_payload, ensure_ascii=False) if response_payload else None,
        status_code=status_code,
        success=success,
        error=error,
        duration_ms=duration_ms,
        related_resource_type=resource_type,
        related_resource_id=str(resource_id) if resource_id else None,
    )
    db.session.add(entry)
    return entry


def send_application(application):
    """Отправить заявку во внешнюю BPM через ЕИШ. Возвращает (external_id, response)."""
    started = time.time()
    payload = {
        'application_id': application.id,
        'service_id': application.service_id,
        'user_id': application.user_id,
        'form_data': application.get_form_data(),
        'submitted_at': application.submitted_at.isoformat() if application.submitted_at else None,
    }

    base_url = current_app.config.get('EISH_BASE_URL')
    log.info('EISH send_application -> %s app=%s', base_url, application.id)

    # Stub: имитируем успешный ответ ЕИШ
    external_id = f"BTR-{uuid.uuid4().hex[:10].upper()}"
    response = {
        'status': 'accepted',
        'external_id': external_id,
        'received_at': time.time(),
    }

    duration = int((time.time() - started) * 1000)
    _log('send_application', request_payload=payload, response_payload=response,
         status_code=200, success=True, duration_ms=duration,
         resource_type='application', resource_id=application.id)
    return external_id, response


def request_status(application):
    """Запросить статус заявки в внешней BPM. Stub возвращает текущий external_status."""
    started = time.time()
    response = {
        'external_id': application.external_id,
        'status': application.external_status or 'in_review',
    }
    duration = int((time.time() - started) * 1000)
    _log('request_status', request_payload={'external_id': application.external_id},
         response_payload=response, status_code=200, success=True, duration_ms=duration,
         resource_type='application', resource_id=application.id)
    return response


def record_inbound(operation, payload, resource_type=None, resource_id=None, success=True):
    """Зарегистрировать входящий webhook от ЕИШ."""
    return _log(operation, request_payload=payload, response_payload={'ok': True},
                status_code=200, success=success, direction='in',
                resource_type=resource_type, resource_id=resource_id)
