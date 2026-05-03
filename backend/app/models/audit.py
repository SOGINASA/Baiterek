from datetime import datetime, timezone

from ..extensions import db


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    actor_label = db.Column(db.String(120))

    action = db.Column(db.String(80), nullable=False, index=True)
    resource_type = db.Column(db.String(80), index=True)
    resource_id = db.Column(db.String(120))

    ip_address = db.Column(db.String(64))
    user_agent = db.Column(db.String(512))

    payload = db.Column(db.Text)
    result = db.Column(db.String(40), default='success')

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'actor_label': self.actor_label,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'ip_address': self.ip_address,
            'result': self.result,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
