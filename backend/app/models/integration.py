from datetime import datetime, timezone

from ..extensions import db


class IntegrationLog(db.Model):
    """Журнал вызовов внешних систем (ЕИШ, eGov IDP, ЭЦП, CRM, Bitrix)."""
    __tablename__ = 'integration_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    integration = db.Column(db.String(40), nullable=False, index=True)
    direction = db.Column(db.String(10), default='out')  # out | in
    operation = db.Column(db.String(80))

    request_payload = db.Column(db.Text)
    response_payload = db.Column(db.Text)
    status_code = db.Column(db.Integer)

    related_resource_type = db.Column(db.String(80))
    related_resource_id = db.Column(db.String(120))

    success = db.Column(db.Boolean, default=True)
    error = db.Column(db.Text)
    duration_ms = db.Column(db.Integer)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'integration': self.integration,
            'direction': self.direction,
            'operation': self.operation,
            'status_code': self.status_code,
            'success': self.success,
            'error': self.error,
            'duration_ms': self.duration_ms,
            'related_resource_type': self.related_resource_type,
            'related_resource_id': self.related_resource_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
