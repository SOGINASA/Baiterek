from flask import Blueprint, jsonify

bp = Blueprint('health', __name__, url_prefix='/api')


@bp.get('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'baiterek-portal'}), 200


@bp.get('/health/ready')
def ready():
    from ..extensions import db
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'status': 'ready'}), 200
    except Exception as e:
        return jsonify({'status': 'not_ready', 'error': str(e)}), 503
