"""Расчётные инструменты: кредитный калькулятор, оценка сметы расходов."""
from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request

from ..decorators import require_user
from ..extensions import db
from ..errors import ApiError, NotFoundError
from ..models.application import Application
from ..models.service import Service

bp = Blueprint('calculators', __name__, url_prefix='/api/calculators')


def _decimal(value, name):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError):
        raise ApiError(f'Поле {name} должно быть числом',
                       status_code=400, code='invalid_number')


@bp.post('/loan')
def loan_calculator():
    data = request.get_json() or {}
    amount = _decimal(data.get('amount', 0), 'amount')
    rate = _decimal(data.get('rate', 0), 'rate')  # годовая %
    term = int(data.get('term_months') or 0)

    if amount <= 0 or term <= 0:
        raise ApiError('amount и term_months должны быть положительными',
                       status_code=400, code='invalid_input')

    # Аннуитет
    monthly_rate = rate / Decimal(100) / Decimal(12)
    if monthly_rate == 0:
        monthly = amount / Decimal(term)
    else:
        factor = (Decimal(1) + monthly_rate) ** term
        monthly = amount * monthly_rate * factor / (factor - Decimal(1))

    monthly = monthly.quantize(Decimal('0.01'))
    total = (monthly * Decimal(term)).quantize(Decimal('0.01'))
    overpayment = (total - amount).quantize(Decimal('0.01'))

    return jsonify({
        'amount': str(amount),
        'rate': str(rate),
        'term_months': term,
        'monthly_payment': str(monthly),
        'total_payment': str(total),
        'overpayment': str(overpayment),
    }), 200


@bp.post('/budget')
@require_user
def budget_estimate(user):
    """Простая автоматизированная смета расходов из списка позиций."""
    data = request.get_json() or {}
    items = data.get('items') or []
    if not isinstance(items, list):
        raise ApiError('items должен быть массивом', status_code=400, code='invalid_input')

    total = Decimal(0)
    normalized = []
    for i, item in enumerate(items):
        if not isinstance(item, dict):
            raise ApiError(f'items[{i}] должен быть объектом',
                           status_code=400, code='invalid_input')
        name = str(item.get('name', '')).strip()
        if not name:
            raise ApiError(f'items[{i}].name обязательно',
                           status_code=400, code='invalid_input')
        qty = _decimal(item.get('quantity', 1), f'items[{i}].quantity')
        price = _decimal(item.get('unit_price', 0), f'items[{i}].unit_price')
        line = (qty * price).quantize(Decimal('0.01'))
        total += line
        normalized.append({
            'name': name,
            'quantity': str(qty),
            'unit_price': str(price),
            'amount': str(line),
            'category': item.get('category'),
        })

    application_id = data.get('application_id')
    if application_id:
        app = Application.query.get(application_id)
        if not app or app.user_id != user.id:
            raise NotFoundError('Заявка не найдена')
        app.calculated_amount = int(total)
        db.session.commit()

    return jsonify({
        'items': normalized,
        'total': str(total.quantize(Decimal('0.01'))),
        'application_id': application_id,
    }), 200
