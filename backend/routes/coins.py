from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
from models import db, User, CoinTransaction

coins_bp = Blueprint('coins', __name__)

# Награды за действия
COIN_REWARDS = {
    'meal_added': 5,
    'meal_analyzed': 10,
    'product_shared': 15,
    'water_logged': 2,
    'streak_7days': 50,
    'streak_30days': 200,
    'first_meal': 20,
    'daily_login': 3,
}

# Цены премиума в коинах
PREMIUM_PRICES = {
    'week': 1000,
    'month': 10000,
}

# Дневной лимит заработка монет
DAILY_EARN_LIMIT = 100


@coins_bp.route('/balance', methods=['GET'])
@jwt_required()
def get_balance():
    """Получить баланс монет и статус премиума"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    # Проверяем, не истёк ли премиум
    is_premium = user.is_premium
    if user.premium_until and user.premium_until < datetime.now(timezone.utc):
        user.is_premium = False
        user.premium_until = None
        db.session.commit()
        is_premium = False

    return jsonify({
        'balance': user.food_coins,
        'isPremium': is_premium,
        'premiumUntil': user.premium_until.isoformat() if user.premium_until else None,
    })


@coins_bp.route('/earn', methods=['POST'])
@jwt_required()
def earn_coins():
    """Начислить монеты за действие"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    data = request.get_json() or {}
    action_type = data.get('action_type')

    if not action_type or action_type not in COIN_REWARDS:
        return jsonify({'error': 'Неизвестный тип действия'}), 400

    # Проверяем дневной лимит заработка
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
    today_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)

    # Считаем сколько монет заработано сегодня (только положительные транзакции)
    earned_today = db.session.query(db.func.coalesce(db.func.sum(CoinTransaction.amount), 0)).filter(
        CoinTransaction.user_id == user_id,
        CoinTransaction.amount > 0,
        CoinTransaction.created_at >= today_start,
        CoinTransaction.created_at <= today_end
    ).scalar()

    if earned_today >= DAILY_EARN_LIMIT:
        return jsonify({
            'success': False,
            'earned': 0,
            'newBalance': user.food_coins,
            'limitReached': True,
            'dailyLimit': DAILY_EARN_LIMIT,
            'earnedToday': earned_today,
            'message': f'Достигнут дневной лимит {DAILY_EARN_LIMIT} монет',
        })

    amount = COIN_REWARDS[action_type]

    # Если начисление превысит лимит, начисляем только остаток до лимита
    remaining = DAILY_EARN_LIMIT - earned_today
    actual_amount = min(amount, remaining)

    if actual_amount <= 0:
        return jsonify({
            'success': False,
            'earned': 0,
            'newBalance': user.food_coins,
            'limitReached': True,
            'dailyLimit': DAILY_EARN_LIMIT,
            'earnedToday': earned_today,
            'message': f'Достигнут дневной лимит {DAILY_EARN_LIMIT} монет',
        })

    # Создаём транзакцию
    transaction = CoinTransaction(
        user_id=user_id,
        amount=actual_amount,
        action_type=action_type,
        description=_get_action_description(action_type),
    )

    user.food_coins += actual_amount

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        'success': True,
        'earned': actual_amount,
        'newBalance': user.food_coins,
        'transaction': transaction.to_dict(),
        'dailyLimit': DAILY_EARN_LIMIT,
        'earnedToday': earned_today + actual_amount,
    })


@coins_bp.route('/spend', methods=['POST'])
@jwt_required()
def spend_coins():
    """Потратить монеты"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    data = request.get_json() or {}
    amount = data.get('amount', 0)
    item_type = data.get('item_type', 'unknown')

    if amount <= 0:
        return jsonify({'error': 'Сумма должна быть положительной'}), 400

    if user.food_coins < amount:
        return jsonify({'error': 'Недостаточно монет'}), 400

    # Создаём транзакцию списания
    transaction = CoinTransaction(
        user_id=user_id,
        amount=-amount,
        action_type=f'spend_{item_type}',
        description=f'Покупка: {item_type}',
    )

    user.food_coins -= amount

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        'success': True,
        'spent': amount,
        'newBalance': user.food_coins,
        'transaction': transaction.to_dict(),
    })


@coins_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Получить историю транзакций"""
    user_id = get_jwt_identity()

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    transactions = CoinTransaction.query.filter_by(user_id=user_id) \
        .order_by(CoinTransaction.created_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'transactions': [t.to_dict() for t in transactions.items],
        'hasMore': transactions.has_next,
        'total': transactions.total,
    })


@coins_bp.route('/purchase-premium', methods=['POST'])
@jwt_required()
def purchase_premium():
    """Купить премиум подписку за монеты"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    data = request.get_json() or {}
    plan = data.get('plan')  # week, month

    if plan not in PREMIUM_PRICES:
        return jsonify({'error': 'Неизвестный тариф'}), 400

    price = PREMIUM_PRICES[plan]

    if user.food_coins < price:
        return jsonify({'error': 'Недостаточно монет'}), 400

    # Создаём транзакцию списания
    transaction = CoinTransaction(
        user_id=user_id,
        amount=-price,
        action_type=f'premium_{plan}',
        description=f'Премиум подписка: {_get_plan_name(plan)}',
    )

    user.food_coins -= price
    user.is_premium = True

    # Устанавливаем срок действия
    now = datetime.now(timezone.utc)
    if plan == 'week':
        user.premium_until = now + timedelta(days=7)
    else:  # month
        user.premium_until = now + timedelta(days=30)

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        'success': True,
        'newBalance': user.food_coins,
        'isPremium': True,
        'premiumUntil': user.premium_until.isoformat(),
        'transaction': transaction.to_dict(),
    })


def _get_action_description(action_type):
    """Получить описание действия на русском"""
    descriptions = {
        'meal_added': 'Добавление еды',
        'meal_analyzed': 'Анализ фото еды',
        'product_shared': 'Передача продукта',
        'water_logged': 'Запись воды',
        'streak_7days': 'Серия 7 дней',
        'streak_30days': 'Серия 30 дней',
        'first_meal': 'Первый приём пищи',
        'daily_login': 'Ежедневный вход',
    }
    return descriptions.get(action_type, action_type)


def _get_plan_name(plan):
    """Получить название тарифа на русском"""
    names = {
        'week': '1 неделя',
        'month': '1 месяц',
    }
    return names.get(plan, plan)
