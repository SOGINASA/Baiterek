from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models.service import Service
from ..models.content import Article, News, Page, Faq
from ..models.subsidiary import Subsidiary

bp = Blueprint('search', __name__, url_prefix='/api/search')

SEARCH_TYPES = ('service', 'article', 'news', 'page', 'faq', 'subsidiary')


def _like(query):
    return f'%{query.lower()}%'


@bp.get('')
def search():
    query = (request.args.get('q') or '').strip()
    if len(query) < 2:
        return jsonify({'query': query, 'results': []}), 200

    types = (request.args.get('types') or '').split(',')
    types = [t for t in types if t in SEARCH_TYPES] or list(SEARCH_TYPES)

    limit_per_type = max(1, min(int(request.args.get('limit', 10)), 50))
    pat = _like(query)
    results = []

    if 'service' in types:
        items = Service.query.filter(
            Service.is_published.is_(True),
            db.or_(
                db.func.lower(Service.title).like(pat),
                db.func.lower(Service.subtitle).like(pat),
                db.func.lower(Service.description).like(pat),
            ),
        ).limit(limit_per_type).all()
        for s in items:
            results.append({
                'type': 'service', 'id': s.id, 'slug': s.slug,
                'title': s.title, 'subtitle': s.subtitle,
                'subsidiary_id': s.subsidiary_id, 'category': s.category_id,
                'url': f'/services/{s.slug}',
            })

    if 'article' in types:
        items = Article.query.filter(
            Article.is_published.is_(True),
            db.or_(
                db.func.lower(Article.title).like(pat),
                db.func.lower(Article.summary).like(pat),
                db.func.lower(Article.content).like(pat),
            ),
        ).limit(limit_per_type).all()
        for a in items:
            results.append({
                'type': 'article', 'id': a.id, 'slug': a.slug,
                'title': a.title, 'subtitle': a.subtitle,
                'category': a.category, 'url': f'/articles/{a.slug}',
            })

    if 'news' in types:
        items = News.query.filter(
            News.is_published.is_(True),
            db.or_(
                db.func.lower(News.title).like(pat),
                db.func.lower(News.summary).like(pat),
                db.func.lower(News.content).like(pat),
            ),
        ).limit(limit_per_type).all()
        for n in items:
            results.append({
                'type': 'news', 'id': n.id, 'slug': n.slug,
                'title': n.title, 'subtitle': n.subtitle,
                'subsidiary_id': n.subsidiary_id,
                'url': f'/news/{n.slug}',
            })

    if 'page' in types:
        items = Page.query.filter(
            Page.is_published.is_(True),
            db.or_(
                db.func.lower(Page.title).like(pat),
                db.func.lower(Page.summary).like(pat),
                db.func.lower(Page.content).like(pat),
            ),
        ).limit(limit_per_type).all()
        for p in items:
            results.append({
                'type': 'page', 'id': p.id, 'slug': p.slug,
                'title': p.title, 'subtitle': p.summary,
                'section': p.section, 'subsidiary_id': p.subsidiary_id,
                'url': f'/pages/{p.slug}',
            })

    if 'faq' in types:
        items = Faq.query.filter(
            Faq.is_published.is_(True),
            db.or_(
                db.func.lower(Faq.question).like(pat),
                db.func.lower(Faq.answer).like(pat),
            ),
        ).limit(limit_per_type).all()
        for f in items:
            results.append({
                'type': 'faq', 'id': f.id, 'title': f.question,
                'subtitle': f.answer[:200] if f.answer else None,
                'category': f.category,
            })

    if 'subsidiary' in types:
        items = Subsidiary.query.filter(
            Subsidiary.is_active.is_(True),
            db.or_(
                db.func.lower(Subsidiary.name).like(pat),
                db.func.lower(Subsidiary.short_name).like(pat),
                db.func.lower(Subsidiary.description).like(pat),
            ),
        ).limit(limit_per_type).all()
        for s in items:
            results.append({
                'type': 'subsidiary', 'id': s.id, 'slug': s.slug,
                'title': s.name, 'subtitle': s.short_name,
                'url': f'/subsidiaries/{s.slug}',
            })

    return jsonify({'query': query, 'total': len(results), 'results': results}), 200
