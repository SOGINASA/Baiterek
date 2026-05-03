"""Telegram Login Widget — верификация подписи авторизации"""

import hmac
import hashlib
import time

from config import Config


def verify_telegram_auth(data: dict) -> bool:
    """
    Проверяет подпись данных от Telegram Login Widget.
    Алгоритм: https://core.telegram.org/widgets/login#checking-authorization
    """
    bot_token = Config.TELEGRAM_BOT_TOKEN
    if not bot_token:
        raise ValueError("TELEGRAM_BOT_TOKEN не сконфигурирован")

    check_hash = data.get('hash')
    if not check_hash:
        return False

    # auth_date не должен быть старше 24 часов (защита от replay-атак)
    auth_date = int(data.get('auth_date', 0))
    if time.time() - auth_date > 86400:
        return False

    # Строка для проверки: отсортированные пары key=value (без hash), разделённые \n
    data_check = {k: v for k, v in data.items() if k != 'hash'}
    data_check_string = '\n'.join(sorted(f"{k}={v}" for k, v in data_check.items()))

    # HMAC-SHA256 с ключом SHA256(bot_token)
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    return hmac.compare_digest(computed_hash, check_hash)
