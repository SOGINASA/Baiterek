def test_register_then_login(client):
    email = 'new_user@example.com'
    r = client.post('/api/auth/register', json={
        'email': email, 'password': 'StrongPass123', 'full_name': 'New One',
    })
    assert r.status_code == 201, r.get_json()
    body = r.get_json()
    assert 'access_token' in body and 'refresh_token' in body
    assert body['user']['email'] == email

    r2 = client.post('/api/auth/login', json={'email': email, 'password': 'StrongPass123'})
    assert r2.status_code == 200
    assert r2.get_json()['user']['email'] == email


def test_register_validation_error(client):
    r = client.post('/api/auth/register', json={'email': 'not-an-email', 'password': '123'})
    assert r.status_code == 422
    assert r.get_json()['code'] == 'validation_error'


def test_login_invalid_credentials(client):
    r = client.post('/api/auth/login', json={'email': 'nope@example.com', 'password': 'x'})
    assert r.status_code == 401


def test_profile_requires_auth(client):
    r = client.get('/api/auth/profile')
    assert r.status_code == 401


def test_profile_authenticated(client, auth_headers):
    r = client.get('/api/auth/profile', headers=auth_headers)
    assert r.status_code == 200
    assert r.get_json()['email'] == 'test_user@baiterek.local'
