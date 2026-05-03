from flask import Blueprint, jsonify, request

from ..errors import NotFoundError
from ..models.category import Category
from ..models.service import Service

bp = Blueprint('categories', __name__, url_prefix='/api/categories')


@bp.get('')
def list_categories():
    items = Category.query.filter_by(is_active=True).order_by(Category.sort_order).all()
    with_children = request.args.get('with_children') in ('1', 'true')
    return jsonify([c.to_dict(with_children=with_children) for c in items]), 200


@bp.get('/<slug>')
def get_category(slug):
    category = Category.query.filter_by(slug=slug).first() or Category.query.get(slug)
    if not category:
        raise NotFoundError('Категория не найдена')
    return jsonify(category.to_dict(with_children=True)), 200


@bp.get('/<slug>/services')
def category_services(slug):
    category = Category.query.filter_by(slug=slug).first() or Category.query.get(slug)
    if not category:
        raise NotFoundError('Категория не найдена')
    services = Service.query.filter_by(category_id=category.id, is_published=True).all()
    return jsonify([s.to_dict() for s in services]), 200
