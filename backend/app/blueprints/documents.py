import os
import shutil
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, send_from_directory

from ..extensions import db
from ..decorators import require_user
from ..errors import NotFoundError, ApiError
from ..models.application import Application
from ..models.document import Document, DocumentVersion, DocumentComment, Signature
from ..schemas.document import DocumentReviewSchema, DocumentCommentSchema, SignDocumentSchema, DocumentMetaSchema
from ..services.audit import audit
from ..services.notifier import notify
from ..integrations import ecp
from ..utils.file_handler import save_file

bp = Blueprint('documents', __name__, url_prefix='/api')


def _check_owner(document, user):
    application = Application.query.get(document.application_id)
    if not application or application.user_id != user.id:
        raise NotFoundError('Документ не найден')
    return application


@bp.post('/applications/<int:app_id>/documents')
@require_user
def upload_document(user, app_id):
    application = Application.query.get(app_id)
    if not application or application.user_id != user.id:
        raise NotFoundError('Заявка не найдена')

    if 'file' not in request.files:
        raise ApiError('Файл не предоставлен', status_code=400, code='no_file')
    file = request.files['file']
    if not file or file.filename == '':
        raise ApiError('Файл не выбран', status_code=400, code='empty_file')

    file_details = save_file(file, app_id)
    if not file_details:
        raise ApiError('Неподдерживаемый тип файла', status_code=400, code='unsupported_file')

    meta = DocumentMetaSchema().load({
        'title': request.form.get('title'),
        'description': request.form.get('description'),
    }, partial=True)

    document = Document(
        application_id=app_id,
        file_name=file_details['file_name'],
        file_path=file_details['file_path'],
        file_type=file_details['file_type'],
        file_size=file_details['file_size'],
        checksum=file_details.get('checksum'),
        title=meta.get('title') or file_details['file_name'],
        description=meta.get('description'),
        uploaded_by_user=True,
        uploaded_by_user_id=user.id,
    )
    db.session.add(document)
    db.session.flush()

    db.session.add(DocumentVersion(
        document_id=document.id,
        version=1,
        file_name=file_details['file_name'],
        file_path=file_details['file_path'],
        file_size=file_details['file_size'],
        checksum=file_details.get('checksum'),
        uploaded_by_user_id=user.id,
        note='Первая версия',
    ))

    notify(user.id, 'Документ загружен',
           f'Документ «{document.file_name}» добавлен к заявке №{app_id}.',
           type='document_required', related_application_id=app_id,
           related_document_id=document.id)
    audit('document.upload', user_id=user.id,
          resource_type='document', resource_id=document.id)
    db.session.commit()
    return jsonify(document.to_dict(with_versions=True)), 201


@bp.get('/applications/<int:app_id>/documents')
@require_user
def list_documents(user, app_id):
    application = Application.query.get(app_id)
    if not application or application.user_id != user.id:
        raise NotFoundError('Заявка не найдена')
    return jsonify([d.to_dict() for d in application.documents.all()]), 200


@bp.get('/documents/<int:doc_id>')
@require_user
def get_document(user, doc_id):
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)
    return jsonify(document.to_dict(with_versions=True, with_comments=True)), 200


@bp.get('/documents/<int:doc_id>/download')
@require_user
def download_document(user, doc_id):
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)
    directory = os.path.dirname(document.file_path)
    filename = os.path.basename(document.file_path)
    audit('document.download', user_id=user.id,
          resource_type='document', resource_id=document.id)
    db.session.commit()
    return send_from_directory(directory, filename, as_attachment=True,
                               download_name=document.file_name)


@bp.post('/documents/<int:doc_id>/versions')
@require_user
def upload_new_version(user, doc_id):
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)

    if 'file' not in request.files:
        raise ApiError('Файл не предоставлен', status_code=400, code='no_file')
    file = request.files['file']
    file_details = save_file(file, document.application_id)
    if not file_details:
        raise ApiError('Неподдерживаемый тип файла', status_code=400, code='unsupported_file')

    new_version = document.current_version + 1
    db.session.add(DocumentVersion(
        document_id=document.id,
        version=new_version,
        file_name=file_details['file_name'],
        file_path=file_details['file_path'],
        file_size=file_details['file_size'],
        checksum=file_details.get('checksum'),
        uploaded_by_user_id=user.id,
        note=request.form.get('note'),
    ))

    document.current_version = new_version
    document.file_name = file_details['file_name']
    document.file_path = file_details['file_path']
    document.file_size = file_details['file_size']
    document.checksum = file_details.get('checksum')
    document.status = 'pending'
    document.is_signed = False
    document.signed_at = None

    audit('document.version', user_id=user.id,
          resource_type='document', resource_id=document.id,
          payload={'version': new_version})
    db.session.commit()
    return jsonify(document.to_dict(with_versions=True)), 201


@bp.post('/documents/<int:doc_id>/comments')
@require_user
def add_comment(user, doc_id):
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)

    data = DocumentCommentSchema().load(request.get_json() or {})
    comment = DocumentComment(
        document_id=document.id,
        author_id=user.id,
        author_label=user.full_name or user.email,
        text=data['text'],
    )
    db.session.add(comment)
    audit('document.comment', user_id=user.id,
          resource_type='document', resource_id=document.id)
    db.session.commit()
    return jsonify(comment.to_dict()), 201


@bp.get('/documents/<int:doc_id>/comments')
@require_user
def list_comments(user, doc_id):
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)
    return jsonify([c.to_dict() for c in document.comments.all()]), 200


@bp.post('/documents/<int:doc_id>/review')
@require_user
def review_document(user, doc_id):
    """Решение пользователя по документу: согласовать / отклонить / запросить правки."""
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)

    data = DocumentReviewSchema().load(request.get_json() or {})
    decision = data['decision']

    mapping = {'approve': 'approved', 'reject': 'rejected', 'revise': 'needs_revision'}
    document.status = mapping[decision]
    document.review_comment = data.get('comment')

    notify(user.id,
           f'Документ {"согласован" if decision == "approve" else "отклонён" if decision == "reject" else "требует правок"}',
           document.title or document.file_name,
           type='document_approved' if decision == 'approve' else 'document_required',
           related_application_id=document.application_id,
           related_document_id=document.id)

    audit(f'document.{decision}', user_id=user.id,
          resource_type='document', resource_id=document.id)
    db.session.commit()
    return jsonify(document.to_dict()), 200


@bp.post('/documents/<int:doc_id>/sign')
@require_user
def sign_document(user, doc_id):
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)

    payload = SignDocumentSchema().load(request.get_json() or {})

    # В dev-окружении принимаем mock-подпись если signature_value не передан
    if not payload.get('signature_value'):
        mock = ecp.generate_mock_signature()
        payload.update(mock)

    valid, _resp = ecp.verify_signature(
        document.file_path, payload['signature_value'],
        payload.get('certificate_serial'),
    )
    if not valid:
        raise ApiError('Подпись не прошла верификацию', status_code=400, code='invalid_signature')

    signature = Signature(
        document_id=document.id,
        document_version=document.current_version,
        signer_id=user.id,
        certificate_serial=payload.get('certificate_serial'),
        certificate_subject=payload.get('certificate_subject'),
        certificate_issuer=payload.get('certificate_issuer'),
        signature_value=payload['signature_value'],
        signature_algorithm=payload.get('signature_algorithm'),
    )
    db.session.add(signature)

    document.is_signed = True
    document.signed_at = datetime.now(timezone.utc)
    document.status = 'signed'

    notify(user.id, 'Документ подписан',
           f'Документ «{document.title or document.file_name}» подписан ЭЦП.',
           type='document_approved', related_application_id=document.application_id,
           related_document_id=document.id)
    audit('document.sign', user_id=user.id,
          resource_type='document', resource_id=document.id)
    db.session.commit()
    return jsonify({
        'document': document.to_dict(),
        'signature': signature.to_dict(),
    }), 200


@bp.delete('/documents/<int:doc_id>')
@require_user
def delete_document(user, doc_id):
    document = Document.query.get(doc_id)
    if not document:
        raise NotFoundError('Документ не найден')
    _check_owner(document, user)

    if document.is_signed:
        raise ApiError('Нельзя удалить подписанный документ',
                       status_code=400, code='document_signed')

    paths = [document.file_path] + [v.file_path for v in document.versions.all()]
    for p in paths:
        try:
            if p and os.path.exists(p):
                os.remove(p)
        except Exception:
            pass

    try:
        directory = os.path.dirname(document.file_path)
        if os.path.isdir(directory) and not os.listdir(directory):
            os.rmdir(directory)
    except Exception:
        pass

    db.session.delete(document)
    audit('document.delete', user_id=user.id,
          resource_type='document', resource_id=doc_id)
    db.session.commit()
    return jsonify({'message': 'Документ удалён'}), 200
