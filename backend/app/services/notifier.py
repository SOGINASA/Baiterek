"""Унифицированное создание in-app уведомлений."""
import json

from ..extensions import db
from ..models.notification import Notification


def notify(user_id, title, message, type='general',
           related_application_id=None, related_document_id=None, payload=None):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        related_application_id=related_application_id,
        related_document_id=related_document_id,
        payload=json.dumps(payload, ensure_ascii=False) if payload is not None else None,
    )
    db.session.add(notification)
    return notification
