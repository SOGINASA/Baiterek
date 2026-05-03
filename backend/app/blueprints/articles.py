from flask import Blueprint, jsonify, request

from ..extensions import db
from ..errors import NotFoundError
from ..models.content import Article
from ..pagination import paginate

bp = Blueprint('articles', __name__, url_prefix='/api/articles')


@bp.get('')
def list_articles():
    q = Article.query.filter_by(is_published=True)

    category = request.args.get('category')
    if category:
        q = q.filter(Article.category == category)

    subsidiary = request.args.get('subsidiary')
    if subsidiary:
        q = q.filter(Article.subsidiary_id == subsidiary)

    text = (request.args.get('q') or '').strip().lower()
    if text:
        like = f'%{text}%'
        q = q.filter(db.or_(
            db.func.lower(Article.title).like(like),
            db.func.lower(Article.summary).like(like),
            db.func.lower(Article.content).like(like),
        ))

    q = q.order_by(Article.created_at.desc())

    if request.args.get('paginated') in ('1', 'true'):
        return jsonify(paginate(q)), 200
    return jsonify([a.to_dict() for a in q.all()]), 200


@bp.get('/<slug>')
def get_article(slug):
    article = Article.query.filter_by(slug=slug, is_published=True).first()
    if not article:
        raise NotFoundError('Статья не найдена')
    return jsonify(article.to_dict()), 200
