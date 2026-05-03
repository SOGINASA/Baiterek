import os
import uuid
import hashlib

from flask import current_app
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt', 'rtf', 'odt', 'csv'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_file(file, application_id):
    if not file or not allowed_file(file.filename):
        return None

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"

    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], str(application_id))
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)

    file_size = os.path.getsize(file_path)
    sha = _sha256(file_path)

    return {
        'file_name': filename,
        'file_path': file_path,
        'file_type': filename.rsplit('.', 1)[1].lower(),
        'file_size': file_size,
        'checksum': sha,
    }


def _sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()
