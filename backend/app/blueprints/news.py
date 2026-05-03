from flask import Blueprint, jsonify, request

from ..extensions import db
from ..errors import NotFoundError
from ..models.content import News
from ..pagination import paginate

bp = Blueprint('news', __name__, url_prefix='/api/news')


@bp.get('')
def list_news():
    q = News.query.filter_by(is_published=True)

    if (sub := request.args.get('subsidiary')):
        q = q.filter(News.subsidiary_id == sub)

    if (type_ := request.args.get('type')):
        q = q.filter(News.type == type_)

    text = (request.args.get('q') or '').strip().lower()
    if text:
        like = f'%{text}%'
        q = q.filter(db.or_(
            db.func.lower(News.title).like(like),
            db.func.lower(News.summary).like(like),
            db.func.lower(News.content).like(like),
        ))

    q = q.order_by(News.published_at.desc())

    if request.args.get('paginated') in ('1', 'true'):
        return jsonify(paginate(q)), 200
    return jsonify([n.to_dict() for n in q.all()]), 200


@bp.get('/<slug>')
def get_news(slug):
    item = News.query.filter_by(slug=slug, is_published=True).first()
    if not item:
        raise NotFoundError('Новость не найдена')
    return jsonify(item.to_dict()), 200
