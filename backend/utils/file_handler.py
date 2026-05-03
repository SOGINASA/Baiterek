import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename):
    """Check if the file extension is allowed."""
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, application_id):
    """Save the uploaded file and return the file details."""
    if file and allowed_file(file.filename):
        # Generate a unique filename to avoid collisions
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # Create application directory if it doesn't exist
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], str(application_id))
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        return {
            'file_name': filename,
            'file_path': file_path,
            'file_type': filename.rsplit('.', 1)[1].lower(),
            'file_size': file_size
        }
    else:
        return None