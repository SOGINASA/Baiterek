from marshmallow import Schema, fields, validate


class ApplicationCreateSchema(Schema):
    service_id = fields.Str(required=True, validate=validate.Length(max=100))
    form_data = fields.Dict(load_default=dict)


class ApplicationUpdateSchema(Schema):
    form_data = fields.Dict()
    status = fields.Str(validate=validate.OneOf([
        'draft', 'submitted', 'in_review', 'awaiting_documents',
        'awaiting_signature', 'approved', 'rejected', 'cancelled', 'completed',
    ]))


class ApplicationStatusCallbackSchema(Schema):
    """Webhook от ЕИШ/BPM для обновления статуса."""
    external_id = fields.Str(required=True)
    status = fields.Str(required=True)
    external_status = fields.Str(load_default=None)
    comment = fields.Str(load_default=None)


class CalculatorRequestSchema(Schema):
    service_id = fields.Str(required=True)
    amount = fields.Decimal(required=True, as_string=True)
    term_months = fields.Integer(required=True, validate=validate.Range(min=1, max=240))
