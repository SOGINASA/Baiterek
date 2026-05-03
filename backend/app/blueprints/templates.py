from flask import Blueprint, jsonify, request

from ..models.content import Template

bp = Blueprint('templates', __name__, url_prefix='/api/templates')


@bp.get('')
def list_templates():
    q = Template.query.filter_by(is_published=True)
    if (cat := request.args.get('category')):
        q = q.filter(Template.category == cat)
    if (sub := request.args.get('subsidiary')):
        q = q.filter(Template.subsidiary_id == sub)
    if (svc := request.args.get('service_id')):
        q = q.filter(Template.service_id == svc)
    return jsonify([t.to_dict() for t in q.all()]), 200
