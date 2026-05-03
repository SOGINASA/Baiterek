from datetime import datetime, timezone

from ..extensions import db


class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    permissions = db.relationship('Permission', secondary='role_permissions', backref='roles')

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'permissions': [p.code for p in self.permissions],
        }


class Permission(db.Model):
    __tablename__ = 'permissions'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.Text)

    def to_dict(self):
        return {'id': self.id, 'code': self.code, 'description': self.description}


role_permissions = db.Table(
    'role_permissions',
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id', ondelete='CASCADE'),
              primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permissions.id', ondelete='CASCADE'),
              primary_key=True),
)


class UserRoleScope(db.Model):
    """Привязка роли к пользователю с опциональным scope (услуга/раздел/субсидиар)."""
    __tablename__ = 'user_role_scopes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'),
                        nullable=False, index=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id', ondelete='CASCADE'),
                        nullable=False, index=True)

    scope_type = db.Column(db.String(40))  # 'service' | 'subsidiary' | 'page' | None
    scope_id = db.Column(db.String(120))   # id или slug ресурса

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    role = db.relationship('Role')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role': self.role.code if self.role else None,
            'scope_type': self.scope_type,
            'scope_id': self.scope_id,
        }
