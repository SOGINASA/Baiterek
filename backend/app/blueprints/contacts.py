from flask import Blueprint, jsonify, request

from ..models.contact import Contact, Office

bp = Blueprint('contacts', __name__, url_prefix='/api/contacts')


@bp.get('')
def list_contacts():
    q = Contact.query
    if (sub := request.args.get('subsidiary')):
        q = q.filter(Contact.subsidiary_id == sub)
    contacts = q.order_by(Contact.sort_order).all()

    offices_q = Office.query.filter_by(is_active=True)
    if sub:
        offices_q = offices_q.filter(Office.subsidiary_id == sub)
    if (city := request.args.get('city')):
        offices_q = offices_q.filter(Office.city.ilike(city))
    offices = offices_q.all()

    return jsonify({
        'contacts': [c.to_dict() for c in contacts],
        'offices': [o.to_dict() for o in offices],
    }), 200
