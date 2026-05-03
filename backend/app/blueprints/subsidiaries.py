from flask import Blueprint, jsonify, request

from ..errors import NotFoundError
from ..models.subsidiary import Subsidiary
from ..models.service import Service
from ..models.content import News, Page, Article, Faq
from ..models.contact import Office, Contact

bp = Blueprint('subsidiaries', __name__, url_prefix='/api/subsidiaries')


@bp.get('')
def list_subsidiaries():
    items = Subsidiary.query.filter_by(is_active=True).order_by(Subsidiary.sort_order).all()
    with_counts = request.args.get('with_counts') in ('1', 'true')
    return jsonify([s.to_dict(with_counts=with_counts) for s in items]), 200


@bp.get('/<slug>')
def get_subsidiary(slug):
    subsidiary = Subsidiary.query.filter_by(slug=slug).first() or Subsidiary.query.get(slug)
    if not subsidiary:
        raise NotFoundError('Дочерняя организация не найдена')
    data = subsidiary.to_dict(with_counts=True)
    return jsonify(data), 200


@bp.get('/<slug>/services')
def subsidiary_services(slug):
    subsidiary = Subsidiary.query.filter_by(slug=slug).first() or Subsidiary.query.get(slug)
    if not subsidiary:
        raise NotFoundError('Дочерняя организация не найдена')
    services = Service.query.filter_by(subsidiary_id=subsidiary.id, is_published=True).all()
    return jsonify([s.to_dict() for s in services]), 200


@bp.get('/<slug>/news')
def subsidiary_news(slug):
    subsidiary = Subsidiary.query.filter_by(slug=slug).first() or Subsidiary.query.get(slug)
    if not subsidiary:
        raise NotFoundError('Дочерняя организация не найдена')
    items = News.query.filter_by(subsidiary_id=subsidiary.id, is_published=True)\
        .order_by(News.published_at.desc()).all()
    return jsonify([n.to_dict() for n in items]), 200


@bp.get('/<slug>/articles')
def subsidiary_articles(slug):
    subsidiary = Subsidiary.query.filter_by(slug=slug).first() or Subsidiary.query.get(slug)
    if not subsidiary:
        raise NotFoundError('Дочерняя организация не найдена')
    items = Article.query.filter_by(subsidiary_id=subsidiary.id, is_published=True).all()
    return jsonify([a.to_dict() for a in items]), 200


@bp.get('/<slug>/contacts')
def subsidiary_contacts(slug):
    subsidiary = Subsidiary.query.filter_by(slug=slug).first() or Subsidiary.query.get(slug)
    if not subsidiary:
        raise NotFoundError('Дочерняя организация не найдена')
    contacts = Contact.query.filter_by(subsidiary_id=subsidiary.id).all()
    offices = Office.query.filter_by(subsidiary_id=subsidiary.id, is_active=True).all()
    return jsonify({
        'contacts': [c.to_dict() for c in contacts],
        'offices': [o.to_dict() for o in offices],
    }), 200


@bp.get('/<slug>/pages')
def subsidiary_pages(slug):
    subsidiary = Subsidiary.query.filter_by(slug=slug).first() or Subsidiary.query.get(slug)
    if not subsidiary:
        raise NotFoundError('Дочерняя организация не найдена')
    pages = Page.query.filter_by(subsidiary_id=subsidiary.id, is_published=True)\
        .order_by(Page.sort_order).all()
    return jsonify([p.to_dict() for p in pages]), 200


@bp.get('/<slug>/faq')
def subsidiary_faq(slug):
    subsidiary = Subsidiary.query.filter_by(slug=slug).first() or Subsidiary.query.get(slug)
    if not subsidiary:
        raise NotFoundError('Дочерняя организация не найдена')
    items = Faq.query.filter_by(subsidiary_id=subsidiary.id, is_published=True)\
        .order_by(Faq.sort_order).all()
    return jsonify([f.to_dict() for f in items]), 200
