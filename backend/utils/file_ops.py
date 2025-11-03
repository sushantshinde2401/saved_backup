import os
import uuid
import re
import shutil
from werkzeug.utils import secure_filename
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def generate_session_id():
    """Generate a unique session ID for temporary file storage"""
    return str(uuid.uuid4())

def sanitize_folder_name(name):
    """Sanitize folder name by replacing spaces with underscores and removing other special characters"""
    # First replace spaces with underscores
    sanitized = str(name).replace(' ', '_')
    # Remove special characters, keep only alphanumeric, underscore, hyphen
    sanitized = re.sub(r'[^a-zA-Z0-9_-]', '', sanitized)
    # Replace multiple underscores/hyphens with single ones
    sanitized = re.sub(r'[-_]+', '_', sanitized)
    # Remove leading/trailing underscores
    sanitized = sanitized.strip('_-')
    return sanitized or 'unnamed'

def create_unique_candidate_folder(base_path, folder_name):
    """Create a unique candidate folder, appending _1, _2, etc. if needed"""
    original_folder = folder_name
    counter = 1

    while os.path.exists(os.path.join(base_path, folder_name)):
        folder_name = f"{original_folder}_{counter}"
        counter += 1

    full_path = os.path.join(base_path, folder_name)
    os.makedirs(full_path, exist_ok=True)
    return full_path, folder_name

def move_files_to_candidate_folder(temp_folder, candidate_folder):
    """Move all files from temp folder to candidate folder, preserving original names"""
    moved_files = []
    errors = []

    if not os.path.exists(temp_folder):
        return moved_files, ["Temporary folder not found"]

    try:
        for filename in os.listdir(temp_folder):
            src_path = os.path.join(temp_folder, filename)
            dst_path = os.path.join(candidate_folder, filename)

            if os.path.isfile(src_path):
                shutil.move(src_path, dst_path)
                moved_files.append(filename)
                print(f"[MOVE] Moved {filename} to candidate folder")

        # Remove empty temp folder
        if os.path.exists(temp_folder) and not os.listdir(temp_folder):
            os.rmdir(temp_folder)
            print(f"[CLEANUP] Removed empty temp folder: {temp_folder}")

    except Exception as e:
        errors.append(f"Error moving files: {str(e)}")

    return moved_files, errors