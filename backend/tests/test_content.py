def test_list_subsidiaries(client):
    r = client.get('/api/subsidiaries')
    assert r.status_code == 200
    items = r.get_json()
    assert isinstance(items, list) and len(items) >= 5


def test_subsidiary_services(client):
    r = client.get('/api/subsidiaries/damu/services')
    assert r.status_code == 200
    services = r.get_json()
    assert any(s['id'] == 'damu-micro-loan' for s in services)


def test_categories(client):
    r = client.get('/api/categories')
    assert r.status_code == 200
    assert any(c['id'] == 'financing' for c in r.get_json())


def test_services_filter(client):
    r = client.get('/api/services?category=financing')
    assert r.status_code == 200
    for s in r.get_json():
        assert s['category'] == 'financing'


def test_service_card(client):
    r = client.get('/api/services/damu-micro-loan')
    assert r.status_code == 200
    body = r.get_json()
    assert body['id'] == 'damu-micro-loan'
    assert 'form_schema' in body


def test_news_list(client):
    r = client.get('/api/news')
    assert r.status_code == 200
    assert len(r.get_json()) >= 2


def test_articles(client):
    r = client.get('/api/articles')
    assert r.status_code == 200


def test_faq(client):
    r = client.get('/api/faq')
    assert r.status_code == 200
    assert len(r.get_json()) >= 1


def test_pages(client):
    r = client.get('/api/pages?section=corporate')
    assert r.status_code == 200


def test_search(client):
    r = client.get('/api/search?q=микрокредит')
    assert r.status_code == 200
    body = r.get_json()
    assert 'results' in body


def test_search_short_query(client):
    r = client.get('/api/search?q=a')
    assert r.status_code == 200
    assert r.get_json()['results'] == []


def test_contacts(client):
    r = client.get('/api/contacts')
    assert r.status_code == 200
    body = r.get_json()
    assert 'contacts' in body and 'offices' in body


def test_vacancies(client):
    r = client.get('/api/vacancies')
    assert r.status_code == 200
