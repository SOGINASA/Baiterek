def test_create_then_submit_with_form_validation(client, auth_headers):
    r = client.post('/api/applications', headers=auth_headers, json={
        'service_id': 'damu-micro-loan',
        'form_data': {'amount': 5_000_000, 'term_months': 24,
                      'purpose': 'Закупка оборудования', 'agreement': True},
    })
    assert r.status_code == 201, r.get_json()
    app_id = r.get_json()['id']

    s = client.post(f'/api/applications/{app_id}/submit', headers=auth_headers)
    assert s.status_code == 200, s.get_json()
    body = s.get_json()
    assert body['status'] in ('submitted', 'in_review')
    assert body['external_id']


def test_submit_form_invalid(client, auth_headers):
    r = client.post('/api/applications', headers=auth_headers, json={
        'service_id': 'damu-micro-loan',
        'form_data': {'amount': 'not-a-number'},
    })
    app_id = r.get_json()['id']
    s = client.post(f'/api/applications/{app_id}/submit', headers=auth_headers)
    assert s.status_code == 422
    assert s.get_json()['code'] == 'form_invalid'


def test_status_history(client, auth_headers):
    r = client.post('/api/applications', headers=auth_headers, json={
        'service_id': 'damu-grant',
        'form_data': {'amount': 1_000_000, 'term_months': 12,
                      'purpose': 'Запуск', 'agreement': True},
    })
    app_id = r.get_json()['id']
    client.post(f'/api/applications/{app_id}/submit', headers=auth_headers)
    h = client.get(f'/api/applications/{app_id}/status', headers=auth_headers)
    assert h.status_code == 200
    body = h.get_json()
    assert len(body['history']) >= 1


def test_calculator_loan(client):
    r = client.post('/api/calculators/loan', json={
        'amount': 1_000_000, 'rate': 6, 'term_months': 12,
    })
    assert r.status_code == 200
    body = r.get_json()
    assert 'monthly_payment' in body and 'total_payment' in body


def test_calculator_budget(client, auth_headers):
    r = client.post('/api/calculators/budget', headers=auth_headers, json={
        'items': [
            {'name': 'Станок', 'quantity': 1, 'unit_price': 2_000_000},
            {'name': 'Сырьё', 'quantity': 100, 'unit_price': 5_000},
        ],
    })
    assert r.status_code == 200
    body = r.get_json()
    assert body['total'] == '2500000.00'


def test_eish_callback_updates_status(client, auth_headers, app):
    r = client.post('/api/applications', headers=auth_headers, json={
        'service_id': 'damu-grant',
        'form_data': {'amount': 1_000_000, 'term_months': 12,
                      'purpose': 'Запуск', 'agreement': True},
    })
    app_id = r.get_json()['id']
    s = client.post(f'/api/applications/{app_id}/submit', headers=auth_headers)
    external_id = s.get_json()['external_id']

    cb = client.post(
        '/api/webhooks/eish/application_status',
        headers={'X-EISH-Token': app.config['EISH_API_KEY']},
        json={'external_id': external_id, 'status': 'approved', 'comment': 'ОК'},
    )
    assert cb.status_code == 200
    final = client.get(f'/api/applications/{app_id}', headers=auth_headers)
    assert final.get_json()['status'] == 'approved'
