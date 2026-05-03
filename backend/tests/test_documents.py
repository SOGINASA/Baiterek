import io


def _make_app(client, headers):
    r = client.post('/api/applications', headers=headers, json={
        'service_id': 'damu-micro-loan',
        'form_data': {'amount': 1_000_000, 'term_months': 12,
                      'purpose': 'Тест', 'agreement': True},
    })
    return r.get_json()['id']


def test_upload_and_version(client, auth_headers):
    app_id = _make_app(client, auth_headers)
    data = {'file': (io.BytesIO(b'hello world'), 'test.pdf')}
    r = client.post(f'/api/applications/{app_id}/documents',
                    headers=auth_headers, data=data,
                    content_type='multipart/form-data')
    assert r.status_code == 201, r.get_json()
    doc_id = r.get_json()['id']

    data2 = {'file': (io.BytesIO(b'updated content'), 'test.pdf'),
             'note': 'Исправлено'}
    v = client.post(f'/api/documents/{doc_id}/versions',
                    headers=auth_headers, data=data2,
                    content_type='multipart/form-data')
    assert v.status_code == 201
    assert v.get_json()['current_version'] == 2


def test_comment_review_sign(client, auth_headers):
    app_id = _make_app(client, auth_headers)
    data = {'file': (io.BytesIO(b'docx'), 'doc.docx')}
    r = client.post(f'/api/applications/{app_id}/documents',
                    headers=auth_headers, data=data,
                    content_type='multipart/form-data')
    doc_id = r.get_json()['id']

    c = client.post(f'/api/documents/{doc_id}/comments',
                    headers=auth_headers, json={'text': 'Прошу проверить'})
    assert c.status_code == 201

    rev = client.post(f'/api/documents/{doc_id}/review',
                      headers=auth_headers, json={'decision': 'approve'})
    assert rev.status_code == 200
    assert rev.get_json()['status'] == 'approved'

    sig = client.post(f'/api/documents/{doc_id}/sign',
                      headers=auth_headers, json={})
    assert sig.status_code == 200
    body = sig.get_json()
    assert body['document']['is_signed'] is True
    assert body['signature']['certificate_serial']
