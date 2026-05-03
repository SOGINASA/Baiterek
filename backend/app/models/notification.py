from datetime import datetime, timezone

from ..extensions import db


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text)
    # application_status, document_required, document_approved, document_signed,
    # booking_reminder, general
    type = db.Column(db.String(50), default='general', index=True)

    related_application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=True)
    related_document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=True)

    payload = db.Column(db.Text)  # опциональный JSON

    is_read = db.Column(db.Boolean, default=False, index=True)
    read_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'related_application_id': self.related_application_id,
            'related_document_id': self.related_document_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
        }
