from marshmallow import Schema, fields, validate


class DocumentReviewSchema(Schema):
    decision = fields.Str(required=True, validate=validate.OneOf(['approve', 'reject', 'revise']))
    comment = fields.Str(load_default=None)


class DocumentCommentSchema(Schema):
    text = fields.Str(required=True, validate=validate.Length(min=1, max=4000))


class SignDocumentSchema(Schema):
    """Запрос подписания документа ЭЦП. signature/cert поступают от NCALayer."""
    signature_value = fields.Str(load_default=None)
    certificate_serial = fields.Str(load_default=None)
    certificate_subject = fields.Str(load_default=None)
    certificate_issuer = fields.Str(load_default=None)
    signature_algorithm = fields.Str(load_default='RSA-SHA256')


class DocumentMetaSchema(Schema):
    title = fields.Str(load_default=None, validate=validate.Length(max=255))
    description = fields.Str(load_default=None)
