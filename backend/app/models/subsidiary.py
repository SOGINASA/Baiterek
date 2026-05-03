from datetime import datetime, timezone

from ..extensions import db


class Subsidiary(db.Model):
    __tablename__ = 'subsidiaries'

    id = db.Column(db.String(50), primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False, index=True)

    name = db.Column(db.String(255), nullable=False)
    short_name = db.Column(db.String(100))
    description = db.Column(db.Text)
    mission = db.Column(db.Text)

    logo_url = db.Column(db.String(500))
    website = db.Column(db.String(500))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    address = db.Column(db.String(500))

    head_name = db.Column(db.String(150))
    head_position = db.Column(db.String(150))

    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    services = db.relationship('Service', backref='subsidiary', lazy='dynamic')
    pages = db.relationship('Page', backref='subsidiary', lazy='dynamic')

    def to_dict(self, with_counts=False):
        data = {
            'id': self.id,
            'slug': self.slug,
            'name': self.name,
            'short_name': self.short_name,
            'description': self.description,
            'mission': self.mission,
            'logo_url': self.logo_url,
            'website': self.website,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'head_name': self.head_name,
            'head_position': self.head_position,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
        }
        if with_counts:
            data['services_count'] = self.services.count()
        return data
