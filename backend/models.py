from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import json

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    
    full_name = db.Column(db.String(100))
    bin_number = db.Column(db.String(20), unique=True, nullable=True)  # БИН для юр.лиц
    user_type = db.Column(db.String(20), default='user')  # user, admin, author
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Связи
    applications = db.relationship('Application', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')

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
            'bin_number': self.bin_number,
            'user_type': self.user_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_sensitive:
            data['is_verified'] = self.is_verified
            data['is_active'] = self.is_active
        return data


class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.String(100), primary_key=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255))
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False, index=True)  # financing, guarantees, export, etc.
    type = db.Column(db.String(50), nullable=False)  # loan, grant, guarantee, subsidy, leasing, investment
    subsidiary_id = db.Column(db.String(50), nullable=False)  # damu, kaznex, kazyna, dbk, kif, esil, kzh
    
    # Финансовые параметры (JSON)
    amount_min = db.Column(db.Integer)  # в тенге
    amount_max = db.Column(db.Integer)  # в тенге
    rate = db.Column(db.String(100))  # '6% годовых' или 'Безвозвратно'
    term = db.Column(db.String(100))  # 'до 36 мес.' или 'Бессрочно'
    
    # Теги (JSON массив)
    tags = db.Column(db.Text)
    
    # Условия и документы (JSON массив)
    conditions = db.Column(db.Text)
    documents = db.Column(db.Text)
    
    timeline = db.Column(db.String(100))  # '7–15 рабочих дней'
    is_popular = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Связи
    applications = db.relationship('Application', backref='service', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'subtitle': self.subtitle,
            'description': self.description,
            'category': self.category,
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
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    service_id = db.Column(db.String(100), db.ForeignKey('services.id'), nullable=False, index=True)
    
    status = db.Column(db.String(50), default='draft')  # draft, submitted, processing, approved, rejected
    status_reason = db.Column(db.Text)  # Причина отклонения или комментарий
    
    # Данные заявки (JSON)
    form_data = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    submitted_at = db.Column(db.DateTime)
    
    # Связи
    documents = db.relationship('Document', backref='application', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'service_id': self.service_id,
            'status': self.status,
            'status_reason': self.status_reason,
            'form_data': json.loads(self.form_data) if self.form_data else {},
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
        }


class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False, index=True)
    
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50))  # pdf, docx, xlsx, jpg, etc.
    file_size = db.Column(db.Integer)  # bytes
    
    status = db.Column(db.String(50), default='pending')  # pending, approved, rejected, signed
    
    uploaded_by_user = db.Column(db.Boolean, default=False)  # true если загружен пользователем, false если от организации
    is_signed = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'status': self.status,
            'uploaded_by_user': self.uploaded_by_user,
            'is_signed': self.is_signed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text)
    type = db.Column(db.String(50))  # application_status, document_required, document_approved, general
    
    related_application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=True)
    
    is_read = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    read_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'related_application_id': self.related_application_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Article(db.Model):
    __tablename__ = 'articles'
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255))
    content = db.Column(db.Text)
    
    category = db.Column(db.String(50))  # knowledge_base, news, corporate_info
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'subtitle': self.subtitle,
            'content': self.content,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class News(db.Model):
    __tablename__ = 'news'
    id = db.Column(db.String(100), primary_key=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255))
    content = db.Column(db.Text)
    
    subsidiary_id = db.Column(db.String(50), index=True)  # Если новость организации, иначе Баитерек
    
    published_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'subtitle': self.subtitle,
            'content': self.content,
            'subsidiary_id': self.subsidiary_id,
            'published_at': self.published_at.isoformat() if self.published_at else None,
        }
