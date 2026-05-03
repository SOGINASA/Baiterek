import json
from datetime import datetime, timezone

from ..extensions import db


class FormSchema(db.Model):
    """JSON-описание формы заявки. Используется для рендера во фронте и серверной валидации."""
    __tablename__ = 'form_schemas'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(80), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    version = db.Column(db.Integer, default=1, nullable=False)

    schema = db.Column(db.Text, nullable=False)  # JSON
    description = db.Column(db.Text)

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def get_schema(self):
        try:
            return json.loads(self.schema) if self.schema else {}
        except (TypeError, ValueError):
            return {}

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'version': self.version,
            'schema': self.get_schema(),
            'description': self.description,
            'is_active': self.is_active,
        }
