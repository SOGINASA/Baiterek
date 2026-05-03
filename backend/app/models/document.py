from datetime import datetime, timezone

from ..extensions import db


class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id', ondelete='CASCADE'),
                               nullable=False, index=True)

    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)
    checksum = db.Column(db.String(128))

    title = db.Column(db.String(255))
    description = db.Column(db.Text)

    # pending | approved | rejected | signed | needs_revision
    status = db.Column(db.String(50), default='pending', nullable=False, index=True)
    review_comment = db.Column(db.Text)

    uploaded_by_user = db.Column(db.Boolean, default=True)
    uploaded_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    is_signed = db.Column(db.Boolean, default=False)
    signed_at = db.Column(db.DateTime)

    current_version = db.Column(db.Integer, default=1, nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    versions = db.relationship('DocumentVersion', backref='document', lazy='dynamic',
                               cascade='all, delete-orphan',
                               order_by='DocumentVersion.version.desc()')
    comments = db.relationship('DocumentComment', backref='document', lazy='dynamic',
                               cascade='all, delete-orphan',
                               order_by='DocumentComment.created_at')
    signatures = db.relationship('Signature', backref='document', lazy='dynamic',
                                 cascade='all, delete-orphan')

    def to_dict(self, with_versions=False, with_comments=False):
        data = {
            'id': self.id,
            'application_id': self.application_id,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'checksum': self.checksum,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'review_comment': self.review_comment,
            'uploaded_by_user': self.uploaded_by_user,
            'is_signed': self.is_signed,
            'signed_at': self.signed_at.isoformat() if self.signed_at else None,
            'current_version': self.current_version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if with_versions:
            data['versions'] = [v.to_dict() for v in self.versions.all()]
        if with_comments:
            data['comments'] = [c.to_dict() for c in self.comments.all()]
        return data


class DocumentVersion(db.Model):
    __tablename__ = 'document_versions'

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id', ondelete='CASCADE'),
                            nullable=False, index=True)
    version = db.Column(db.Integer, nullable=False)

    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    checksum = db.Column(db.String(128))

    uploaded_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    note = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'checksum': self.checksum,
            'note': self.note,
            'uploaded_by_user_id': self.uploaded_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class DocumentComment(db.Model):
    __tablename__ = 'document_comments'

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id', ondelete='CASCADE'),
                            nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    author_label = db.Column(db.String(120))  # 'Пользователь' / 'Сотрудник Даму'
    text = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'author_id': self.author_id,
            'author_label': self.author_label,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Signature(db.Model):
    """Информация о подписи ЭЦП документа (метаданные сертификата)."""
    __tablename__ = 'signatures'

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id', ondelete='CASCADE'),
                            nullable=False, index=True)
    document_version = db.Column(db.Integer, nullable=False)
    signer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    certificate_serial = db.Column(db.String(120))
    certificate_issuer = db.Column(db.String(255))
    certificate_subject = db.Column(db.String(255))

    signature_value = db.Column(db.Text)  # base64 CMS / detached
    signature_algorithm = db.Column(db.String(80))

    is_valid = db.Column(db.Boolean, default=True)
    signed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'document_version': self.document_version,
            'signer_id': self.signer_id,
            'certificate_serial': self.certificate_serial,
            'certificate_subject': self.certificate_subject,
            'certificate_issuer': self.certificate_issuer,
            'signature_algorithm': self.signature_algorithm,
            'is_valid': self.is_valid,
            'signed_at': self.signed_at.isoformat() if self.signed_at else None,
        }
