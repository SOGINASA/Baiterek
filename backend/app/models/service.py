import json
from datetime import datetime, timezone

from ..extensions import db


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.String(100), primary_key=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)

    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255))
    description = db.Column(db.Text)
    result = db.Column(db.Text)

    category_id = db.Column(db.String(50), db.ForeignKey('categories.id'), index=True)
    type = db.Column(db.String(50), nullable=False)
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'),
                              nullable=False, index=True)

    amount_min = db.Column(db.BigInteger)
    amount_max = db.Column(db.BigInteger)
    rate = db.Column(db.String(150))
    term = db.Column(db.String(150))

    tags = db.Column(db.Text)
    conditions = db.Column(db.Text)
    documents = db.Column(db.Text)

    timeline = db.Column(db.String(150))
    is_popular = db.Column(db.Boolean, default=False)
    is_priority = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=True)

    form_schema_id = db.Column(db.Integer, db.ForeignKey('form_schemas.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    applications = db.relationship('Application', backref='service', lazy='dynamic',
                                   cascade='all, delete-orphan')
    category = db.relationship('Category')
    form_schema = db.relationship('FormSchema')

    def to_dict(self, with_form=False):
        data = {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'subtitle': self.subtitle,
            'description': self.description,
            'result': self.result,
            'category': self.category_id,
            'type': self.type,
            'subsidiaryId': self.subsidiary_id,
            'amount': {
                'min': self.amount_min or 0,
                'max': self.amount_max or 0,
            },
            'rate': {'label': self.rate or 'По запросу'},
            'term': {'label': self.term or 'По запросу'},
            'tags': json.loads(self.tags) if self.tags else [],
            'conditions': json.loads(self.conditions) if self.conditions else [],
            'documents': json.loads(self.documents) if self.documents else [],
            'timeline': self.timeline,
            'popular': self.is_popular,
            'priority': self.is_priority,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
        if with_form and self.form_schema:
            data['form_schema'] = self.form_schema.to_dict()
        return data
