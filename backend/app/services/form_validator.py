"""
Серверная валидация данных заявки по JSON-схеме формы.

Описание формы:
{
  "fields": [
    {"name": "amount", "label": "Сумма", "type": "number",
     "required": true, "min": 1000000, "max": 30000000},
    {"name": "purpose", "type": "string", "required": true,
     "max_length": 500},
    {"name": "term", "type": "enum", "required": true,
     "options": ["12", "24", "36"]},
    {"name": "agreement", "type": "boolean", "required": true}
  ]
}
"""

from decimal import Decimal, InvalidOperation


class FormValidationError(Exception):
    def __init__(self, errors):
        super().__init__('form_validation_error')
        self.errors = errors


def validate_form_data(schema, data):
    """Возвращает нормализованные данные либо бросает FormValidationError."""
    if not schema or not isinstance(schema, dict):
        return data or {}

    fields = schema.get('fields', [])
    errors = {}
    cleaned = {}
    data = data or {}

    for field in fields:
        name = field.get('name')
        if not name:
            continue
        value = data.get(name)
        required = field.get('required', False)

        if value in (None, '', []):
            if required:
                errors[name] = ['Поле обязательно для заполнения']
            continue

        ftype = field.get('type', 'string')
        try:
            cleaned[name] = _validate_field(field, ftype, value)
        except ValueError as exc:
            errors[name] = [str(exc)]

    if errors:
        raise FormValidationError(errors)
    return cleaned


def _validate_field(field, ftype, value):
    if ftype == 'string':
        s = str(value).strip()
        max_len = field.get('max_length')
        if max_len and len(s) > max_len:
            raise ValueError(f'Длина не должна превышать {max_len} символов')
        min_len = field.get('min_length')
        if min_len and len(s) < min_len:
            raise ValueError(f'Длина должна быть не менее {min_len} символов')
        return s

    if ftype in ('number', 'integer', 'amount'):
        try:
            num = Decimal(str(value))
        except (InvalidOperation, TypeError):
            raise ValueError('Должно быть числом')
        mn = field.get('min')
        mx = field.get('max')
        if mn is not None and num < Decimal(str(mn)):
            raise ValueError(f'Значение должно быть не меньше {mn}')
        if mx is not None and num > Decimal(str(mx)):
            raise ValueError(f'Значение должно быть не больше {mx}')
        if ftype == 'integer':
            return int(num)
        return float(num)

    if ftype == 'boolean':
        return bool(value)

    if ftype == 'enum':
        options = field.get('options', [])
        if str(value) not in [str(o) for o in options]:
            raise ValueError(f'Допустимые значения: {", ".join(map(str, options))}')
        return value

    if ftype == 'date':
        return str(value)

    return value
