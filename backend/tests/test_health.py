def test_health(client):
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.get_json()['status'] == 'ok'


def test_ready(client):
    r = client.get('/api/health/ready')
    assert r.status_code == 200
