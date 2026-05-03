from marshmallow import Schema, fields, validate


class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6, max=128))
    full_name = fields.Str(load_default='', validate=validate.Length(max=150))
    phone = fields.Str(load_default=None, validate=validate.Length(max=30))
    iin_number = fields.Str(load_default=None, validate=validate.Length(equal=12))
    bin_number = fields.Str(load_default=None, validate=validate.Length(equal=12))
    organization_name = fields.Str(load_default=None, validate=validate.Length(max=255))
    position = fields.Str(load_default=None, validate=validate.Length(max=150))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class RefreshSchema(Schema):
    pass


class ProfileUpdateSchema(Schema):
    full_name = fields.Str(validate=validate.Length(max=150))
    phone = fields.Str(validate=validate.Length(max=30))
    organization_name = fields.Str(validate=validate.Length(max=255))
    position = fields.Str(validate=validate.Length(max=150))
