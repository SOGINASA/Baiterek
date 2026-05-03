from datetime import datetime, timezone

from ..extensions import db


class Office(db.Model):
    __tablename__ = 'offices'

    id = db.Column(db.Integer, primary_key=True)
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), index=True)

    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(40), default='office')  # office | branch | representative
    city = db.Column(db.String(100))
    region = db.Column(db.String(100))
    address = db.Column(db.String(500))
    phone = db.Column(db.String(80))
    email = db.Column(db.String(120))
    working_hours = db.Column(db.String(255))

    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'subsidiary_id': self.subsidiary_id,
            'name': self.name,
            'type': self.type,
            'city': self.city,
            'region': self.region,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'working_hours': self.working_hours,
            'lat': self.lat,
            'lng': self.lng,
        }


class Contact(db.Model):
    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), index=True)

    name = db.Column(db.String(255))
    position = db.Column(db.String(255))
    department = db.Column(db.String(255))
    phone = db.Column(db.String(80))
    email = db.Column(db.String(120))
    description = db.Column(db.Text)

    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'subsidiary_id': self.subsidiary_id,
            'name': self.name,
            'position': self.position,
            'department': self.department,
            'phone': self.phone,
            'email': self.email,
            'description': self.description,
        }
