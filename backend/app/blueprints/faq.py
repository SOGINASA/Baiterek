from flask import Blueprint, jsonify, request

from ..models.content import Faq

bp = Blueprint('faq', __name__, url_prefix='/api/faq')


@bp.get('')
def list_faq():
    q = Faq.query.filter_by(is_published=True)
    category = request.args.get('category')
    if category:
        q = q.filter(Faq.category == category)
    subsidiary = request.args.get('subsidiary')
    if subsidiary:
        q = q.filter(Faq.subsidiary_id == subsidiary)
    q = q.order_by(Faq.sort_order, Faq.id)
    return jsonify([f.to_dict() for f in q.all()]), 200
