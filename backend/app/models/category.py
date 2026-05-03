from datetime import datetime, timezone

from ..extensions import db


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.String(50), primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(80))
    color = db.Column(db.String(20))

    parent_id = db.Column(db.String(50), db.ForeignKey('categories.id'), nullable=True)
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))

    def to_dict(self, with_children=False):
        data = {
            'id': self.id,
            'slug': self.slug,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'parent_id': self.parent_id,
            'sort_order': self.sort_order,
        }
        if with_children:
            data['children'] = [c.to_dict() for c in self.children]
        return data
