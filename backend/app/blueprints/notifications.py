from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from ..extensions import db
from ..decorators import require_user
from ..errors import NotFoundError
from ..models.notification import Notification

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@bp.get('')
@require_user
def list_notifications(user):
    q = Notification.query.filter_by(user_id=user.id)
    if request.args.get('unread') in ('1', 'true'):
        q = q.filter_by(is_read=False)
    q = q.order_by(Notification.created_at.desc())
    return jsonify([n.to_dict() for n in q.all()]), 200


@bp.get('/unread_count')
@require_user
def unread_count(user):
    count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify({'count': count}), 200


@bp.put('/<int:notif_id>/read')
@require_user
def mark_read(user, notif_id):
    notification = Notification.query.get(notif_id)
    if not notification or notification.user_id != user.id:
        raise NotFoundError('Уведомление не найдено')
    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(notification.to_dict()), 200


@bp.put('/read_all')
@require_user
def mark_all_read(user):
    Notification.query.filter_by(user_id=user.id, is_read=False).update({
        'is_read': True,
        'read_at': datetime.now(timezone.utc),
    })
    db.session.commit()
    return jsonify({'status': 'ok'}), 200
