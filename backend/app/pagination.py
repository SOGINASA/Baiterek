from flask import request, current_app


def get_pagination():
    try:
        page = max(1, int(request.args.get('page', 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        per_page = int(request.args.get('per_page', current_app.config['DEFAULT_PAGE_SIZE']))
    except (TypeError, ValueError):
        per_page = current_app.config['DEFAULT_PAGE_SIZE']
    per_page = max(1, min(per_page, current_app.config['MAX_PAGE_SIZE']))
    return page, per_page


def paginate(query, serializer=lambda x: x.to_dict()):
    page, per_page = get_pagination()
    total = query.count()
    items = query.limit(per_page).offset((page - 1) * per_page).all()
    return {
        'items': [serializer(i) for i in items],
        'page': page,
        'per_page': per_page,
        'total': total,
        'pages': (total + per_page - 1) // per_page if per_page else 0,
    }
