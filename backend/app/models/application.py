import json
from datetime import datetime, timezone

from ..extensions import db


APPLICATION_STATUSES = (
    'draft', 'submitted', 'in_review', 'awaiting_documents',
    'awaiting_signature', 'approved', 'rejected', 'cancelled', 'completed',
)


class Application(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    service_id = db.Column(db.String(100), db.ForeignKey('services.id'),
                           nullable=False, index=True)

    status = db.Column(db.String(50), default='draft', nullable=False, index=True)
    status_reason = db.Column(db.Text)

    form_data = db.Column(db.Text)
    calculated_amount = db.Column(db.BigInteger)

    external_id = db.Column(db.String(120), index=True)  # id в внешней BPM (через ЕИШ)
    external_status = db.Column(db.String(80))

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    submitted_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

    documents = db.relationship('Document', backref='application', lazy='dynamic',
                                cascade='all, delete-orphan')
    status_history = db.relationship('ApplicationStatusHistory', backref='application',
                                     lazy='dynamic', cascade='all, delete-orphan',
                                     order_by='ApplicationStatusHistory.created_at')

    def get_form_data(self):
        try:
            return json.loads(self.form_data) if self.form_data else {}
        except (TypeError, ValueError):
            return {}

    def to_dict(self, with_documents=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'service_id': self.service_id,
            'status': self.status,
            'status_reason': self.status_reason,
            'external_id': self.external_id,
            'external_status': self.external_status,
            'form_data': self.get_form_data(),
            'calculated_amount': self.calculated_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
        if with_documents:
            data['documents'] = [d.to_dict() for d in self.documents.all()]
            data['history'] = [h.to_dict() for h in self.status_history.all()]
        return data


class ApplicationStatusHistory(db.Model):
    __tablename__ = 'application_status_history'

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id', ondelete='CASCADE'),
                               nullable=False, index=True)
    from_status = db.Column(db.String(50))
    to_status = db.Column(db.String(50), nullable=False)
    comment = db.Column(db.Text)
    actor = db.Column(db.String(100))  # 'user' | 'system' | 'eish' | админ-логин

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'from_status': self.from_status,
            'to_status': self.to_status,
            'comment': self.comment,
            'actor': self.actor,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
