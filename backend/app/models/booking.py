from datetime import datetime, timezone

from ..extensions import db


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), nullable=False)
    office_id = db.Column(db.Integer, db.ForeignKey('offices.id'), nullable=True)
    service_id = db.Column(db.String(100), db.ForeignKey('services.id'), nullable=True)

    slot_at = db.Column(db.DateTime, nullable=False, index=True)
    duration_minutes = db.Column(db.Integer, default=30)

    status = db.Column(db.String(40), default='pending', index=True)
    # pending | confirmed | cancelled | completed | no_show
    reference = db.Column(db.String(80))  # код брони / внешний id Bitrix
    note = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subsidiary_id': self.subsidiary_id,
            'office_id': self.office_id,
            'service_id': self.service_id,
            'slot_at': self.slot_at.isoformat() if self.slot_at else None,
            'duration_minutes': self.duration_minutes,
            'status': self.status,
            'reference': self.reference,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
