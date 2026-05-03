"""Сервис ЭЦП (NCALayer / SHEP).

Заглушка: принимает signature_value+certificate_*, не валидирует криптографически
(в проде делается через NCALayer SDK). Сохраняет метаданные подписи и пишет
в IntegrationLog.
"""
import json
import time
import uuid
import logging

from ..extensions import db
from ..models.integration import IntegrationLog

log = logging.getLogger(__name__)


def verify_signature(file_path, signature_value, certificate_serial=None):
    """Проверить ЭЦП. Stub возвращает True для непустых данных."""
    started = time.time()
    success = bool(signature_value)
    response = {'valid': success}

    entry = IntegrationLog(
        integration='ecp',
        direction='out',
        operation='verify_signature',
        request_payload=json.dumps({
            'file_path': file_path,
            'cert_serial': certificate_serial,
        }),
        response_payload=json.dumps(response),
        status_code=200 if success else 400,
        success=success,
        duration_ms=int((time.time() - started) * 1000),
    )
    db.session.add(entry)
    return success, response


def generate_mock_signature():
    """Сгенерировать псевдоподпись для dev-окружения."""
    return {
        'signature_value': uuid.uuid4().hex + uuid.uuid4().hex,
        'certificate_serial': uuid.uuid4().hex[:16].upper(),
        'certificate_subject': 'CN=DEV USER, OU=Test, O=Baiterek, C=KZ',
        'certificate_issuer': 'CN=DEV CA, O=Baiterek, C=KZ',
        'signature_algorithm': 'RSA-SHA256',
    }
