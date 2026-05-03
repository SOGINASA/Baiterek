from ..extensions import db


class Vacancy(db.Model):
    """Заглушка / редирект на внешний HR-портал Холдинга."""
    __tablename__ = 'vacancies'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    external_url = db.Column(db.String(500), nullable=False)
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), nullable=True)

    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'external_url': self.external_url,
            'subsidiary_id': self.subsidiary_id,
        }
