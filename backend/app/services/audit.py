"""Запись событий в журнал аудита (требование ТЗ к ИБ)."""
import json
import logging

from flask import request

from ..extensions import db
from ..models.audit import AuditLog

log = logging.getLogger(__name__)


def audit(action, resource_type=None, resource_id=None,
          user_id=None, payload=None, result='success', actor_label=None):
    try:
        ip = request.headers.get('X-Forwarded-For', request.remote_addr) if request else None
        ua = request.headers.get('User-Agent', '')[:512] if request else None
    except RuntimeError:
        ip, ua = None, None

    entry = AuditLog(
        user_id=user_id,
        actor_label=actor_label,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id is not None else None,
        ip_address=ip,
        user_agent=ua,
        payload=json.dumps(payload, ensure_ascii=False) if payload else None,
        result=result,
    )
    db.session.add(entry)
    log.info(
        'audit %s %s/%s user=%s result=%s',
        action, resource_type, resource_id, user_id, result,
    )
    return entry
