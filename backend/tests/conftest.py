import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

os.environ['FLASK_ENV'] = 'testing'

from app import create_app
from app.extensions import db as _db
from config import TestingConfig


@pytest.fixture(scope='session')
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        _db.create_all()
        from app.seeder import run_seed
        run_seed()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    payload = {'email': 'test_user@baiterek.local', 'password': 'TestPass123', 'full_name': 'Test User'}
    resp = client.post('/api/auth/register', json=payload)
    if resp.status_code == 409:
        resp = client.post('/api/auth/login', json={'email': payload['email'], 'password': payload['password']})
    token = resp.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}
