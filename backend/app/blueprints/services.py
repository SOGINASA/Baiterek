import json

from flask import Blueprint, request, jsonify

from ..extensions import db
from ..errors import NotFoundError
from ..models.service import Service
from ..pagination import paginate

bp = Blueprint('services', __name__, url_prefix='/api/services')


@bp.get('')
def list_services():
    q = Service.query.filter_by(is_published=True)

    category = request.args.get('category')
    if category:
        q = q.filter(Service.category_id == category)

    type_ = request.args.get('type')
    if type_:
        q = q.filter(Service.type == type_)

    subsidiary = request.args.get('subsidiary')
    if subsidiary:
        q = q.filter(Service.subsidiary_id == subsidiary)

    if request.args.get('popular') in ('1', 'true', 'yes'):
        q = q.filter(Service.is_popular.is_(True))

    query_text = (request.args.get('q') or request.args.get('query') or '').strip().lower()
    if query_text:
        like = f'%{query_text}%'
        q = q.filter(db.or_(
            db.func.lower(Service.title).like(like),
            db.func.lower(Service.subtitle).like(like),
            db.func.lower(Service.description).like(like),
        ))

    sort = request.args.get('sort', 'title')
    if sort == 'amount_desc':
        q = q.order_by(Service.amount_max.desc().nullslast())
    elif sort == 'amount_asc':
        q = q.order_by(Service.amount_max.asc().nullsfirst())
    elif sort == 'updated':
        q = q.order_by(Service.updated_at.desc())
    else:
        q = q.order_by(Service.is_priority.desc(), Service.is_popular.desc(), Service.title.asc())

    if request.args.get('paginated') in ('1', 'true'):
        return jsonify(paginate(q)), 200

    return jsonify([s.to_dict() for s in q.all()]), 200


@bp.get('/<slug>')
def get_service(slug):
    service = Service.query.filter_by(slug=slug).first()
    if not service:
        raise NotFoundError('Сервис не найден')
    return jsonify(service.to_dict(with_form=True)), 200


@bp.get('/<slug>/form')
def get_service_form(slug):
    service = Service.query.filter_by(slug=slug).first()
    if not service:
        raise NotFoundError('Сервис не найден')
    if not service.form_schema:
        return jsonify({'schema': {'fields': []}}), 200
    return jsonify(service.form_schema.to_dict()), 200
