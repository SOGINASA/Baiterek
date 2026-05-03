from flask import Blueprint, jsonify, request

from ..errors import NotFoundError
from ..models.content import Page

bp = Blueprint('pages', __name__, url_prefix='/api/pages')


@bp.get('')
def list_pages():
    q = Page.query.filter_by(is_published=True)
    section = request.args.get('section')
    if section:
        q = q.filter(Page.section == section)
    subsidiary = request.args.get('subsidiary')
    if subsidiary:
        q = q.filter(Page.subsidiary_id == subsidiary)
    q = q.order_by(Page.sort_order, Page.title)
    return jsonify([p.to_dict() for p in q.all()]), 200


@bp.get('/<slug>')
def get_page(slug):
    page = Page.query.filter_by(slug=slug, is_published=True).first()
    if not page:
        raise NotFoundError('Страница не найдена')
    return jsonify(page.to_dict(with_blocks=True, with_children=True)), 200
