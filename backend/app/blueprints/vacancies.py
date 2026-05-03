from flask import Blueprint, jsonify

from ..models.vacancy import Vacancy

bp = Blueprint('vacancies', __name__, url_prefix='/api/vacancies')


@bp.get('')
def list_vacancies():
    items = Vacancy.query.filter_by(is_active=True).all()
    return jsonify([v.to_dict() for v in items]), 200
