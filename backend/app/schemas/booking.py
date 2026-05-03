from marshmallow import Schema, fields, validate


class BookingCreateSchema(Schema):
    subsidiary_id = fields.Str(required=True)
    office_id = fields.Integer(load_default=None)
    service_id = fields.Str(load_default=None)
    slot_at = fields.DateTime(required=True)
    duration_minutes = fields.Integer(load_default=30, validate=validate.Range(min=10, max=240))
    note = fields.Str(load_default=None, validate=validate.Length(max=1000))


class BookingCancelSchema(Schema):
    reason = fields.Str(load_default=None, validate=validate.Length(max=500))
