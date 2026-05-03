from datetime import datetime, timezone

from werkzeug.security import generate_password_hash, check_password_hash

from ..extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)

    full_name = db.Column(db.String(150))
    phone = db.Column(db.String(30))
    iin_number = db.Column(db.String(20), unique=True, nullable=True)
    bin_number = db.Column(db.String(20), unique=False, nullable=True, index=True)
    organization_name = db.Column(db.String(255))
    position = db.Column(db.String(150))

    user_type = db.Column(db.String(20), default='user', nullable=False)
    can_sign = db.Column(db.Boolean, default=False)
    can_sign_financial = db.Column(db.Boolean, default=False)
    is_first_head = db.Column(db.Boolean, default=False)

    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)

    egov_subject = db.Column(db.String(120), unique=True, nullable=True)
    ecp_certificate_serial = db.Column(db.String(120), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    applications = db.relationship('Application', backref='user', lazy='dynamic',
                                   cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic',
                                    cascade='all, delete-orphan')
    role_scopes = db.relationship('UserRoleScope', backref='user', lazy='dynamic',
                                  cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'bin_number': self.bin_number,
            'organization_name': self.organization_name,
            'position': self.position,
            'user_type': self.user_type,
            'can_sign': self.can_sign,
            'can_sign_financial': self.can_sign_financial,
            'is_first_head': self.is_first_head,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_sensitive:
            data['iin_number'] = self.iin_number
            data['is_verified'] = self.is_verified
            data['is_active'] = self.is_active
            data['ecp_bound'] = bool(self.ecp_certificate_serial)
        return data
