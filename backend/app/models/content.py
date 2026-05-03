from datetime import datetime, timezone

from ..extensions import db


class Page(db.Model):
    """CMS-страница для корпоративных разделов и разделов дочерних организаций."""
    __tablename__ = 'pages'

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)

    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text)
    content = db.Column(db.Text)

    section = db.Column(db.String(50), default='corporate', index=True)
    # corporate | subsidiary | knowledge | help | other
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('pages.id'), nullable=True)

    is_published = db.Column(db.Boolean, default=True, index=True)
    sort_order = db.Column(db.Integer, default=0)

    seo_title = db.Column(db.String(255))
    seo_description = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    children = db.relationship('Page', backref=db.backref('parent', remote_side=[id]))
    blocks = db.relationship('ContentBlock', backref='page', lazy='dynamic',
                             cascade='all, delete-orphan',
                             order_by='ContentBlock.sort_order')

    def to_dict(self, with_blocks=False, with_children=False):
        data = {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'summary': self.summary,
            'content': self.content,
            'section': self.section,
            'subsidiary_id': self.subsidiary_id,
            'parent_id': self.parent_id,
            'is_published': self.is_published,
            'sort_order': self.sort_order,
            'seo_title': self.seo_title,
            'seo_description': self.seo_description,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if with_blocks:
            data['blocks'] = [b.to_dict() for b in self.blocks.all()]
        if with_children:
            data['children'] = [c.to_dict() for c in self.children]
        return data


class ContentBlock(db.Model):
    """Структурный блок страницы (hero, текст, список услуг, новости и пр.)."""
    __tablename__ = 'content_blocks'

    id = db.Column(db.Integer, primary_key=True)
    page_id = db.Column(db.Integer, db.ForeignKey('pages.id', ondelete='CASCADE'),
                        nullable=False, index=True)

    block_type = db.Column(db.String(50), nullable=False)  # hero | text | list | services | news
    title = db.Column(db.String(255))
    body = db.Column(db.Text)
    config = db.Column(db.Text)  # JSON для настроек блока
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        import json as _json
        return {
            'id': self.id,
            'block_type': self.block_type,
            'title': self.title,
            'body': self.body,
            'config': _json.loads(self.config) if self.config else {},
            'sort_order': self.sort_order,
        }


class Article(db.Model):
    """База знаний / статьи / разъяснения."""
    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255))
    summary = db.Column(db.Text)
    content = db.Column(db.Text)

    category = db.Column(db.String(80), index=True)
    # knowledge_base | guide | faq | analytics | recommendations
    tags = db.Column(db.Text)  # JSON array
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), nullable=True)

    cover_url = db.Column(db.String(500))
    reading_time = db.Column(db.Integer)
    is_published = db.Column(db.Boolean, default=True, index=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        import json as _json
        return {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'subtitle': self.subtitle,
            'summary': self.summary,
            'content': self.content,
            'category': self.category,
            'tags': _json.loads(self.tags) if self.tags else [],
            'subsidiary_id': self.subsidiary_id,
            'cover_url': self.cover_url,
            'reading_time': self.reading_time,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Faq(db.Model):
    __tablename__ = 'faqs'

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), index=True)
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), nullable=True)

    sort_order = db.Column(db.Integer, default=0)
    is_published = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'category': self.category,
            'subsidiary_id': self.subsidiary_id,
            'sort_order': self.sort_order,
        }


class Template(db.Model):
    """Шаблоны документов и иные вспомогательные материалы для пользователей."""
    __tablename__ = 'templates'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)

    category = db.Column(db.String(80))
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), nullable=True)
    service_id = db.Column(db.String(100), db.ForeignKey('services.id'), nullable=True)

    is_published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'file_url': self.file_url,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'category': self.category,
            'subsidiary_id': self.subsidiary_id,
            'service_id': self.service_id,
        }


class News(db.Model):
    __tablename__ = 'news'

    id = db.Column(db.String(100), primary_key=True)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)

    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255))
    content = db.Column(db.Text)
    summary = db.Column(db.Text)

    cover_url = db.Column(db.String(500))
    type = db.Column(db.String(40), default='news')  # news | press_release | event_announce
    subsidiary_id = db.Column(db.String(50), db.ForeignKey('subsidiaries.id'), index=True)

    is_published = db.Column(db.Boolean, default=True, index=True)

    published_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'subtitle': self.subtitle,
            'summary': self.summary,
            'content': self.content,
            'cover_url': self.cover_url,
            'type': self.type,
            'subsidiary_id': self.subsidiary_id,
            'is_published': self.is_published,
            'published_at': self.published_at.isoformat() if self.published_at else None,
        }
