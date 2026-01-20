from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime
import pytesseract
from PIL import Image
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config
from database import execute_query
from utils.file_ops import allowed_file, generate_session_id
from ocr.passport import extract_passport_front_data, extract_passport_back_data
from ocr.cdc import extract_cdc_data

upload_bp = Blueprint('upload', __name__)

# Initialize limiter for this blueprint
limiter = Limiter(key_func=get_remote_address)

@upload_bp.route('/upload-images', methods=['POST', 'OPTIONS'])
@limiter.limit("10 per minute")  # Limit file uploads to prevent abuse
def upload_images():
    """
    Handle multiple file uploads, store images temporarily in session-based temp folder, and perform OCR processing
    Expected files: photo, signature, passport_front_img, passport_back_img, cdc_img (optional), marksheet (optional)
    """
    try:
        # Check if required files are present
        required_files = ['photo', 'signature', 'passport_front_img', 'passport_back_img']
        for file_key in required_files:
            if file_key not in request.files:
                return jsonify({"error": f"Missing required file: {file_key}"}), 400

            file = request.files[file_key]
            if file.filename == '':
                return jsonify({"error": f"No file selected for: {file_key}"}), 400

        # Generate session ID for this upload session
        session_id = generate_session_id()

        # Create temp session folder
        temp_session_folder = f"{Config.TEMP_FOLDER}/{session_id}"
        os.makedirs(temp_session_folder, exist_ok=True)

        # File validation settings
        MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB per image
        ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/jpg', 'image/gif'}

        # Process and validate uploaded files
        uploaded_files = {}
        temp_file_paths = {}

        try:
            for file_key in ['photo', 'signature', 'passport_front_img', 'passport_back_img', 'cdc_img', 'marksheet', 'coc_img']:
                if file_key in request.files:
                    file = request.files[file_key]
                    if file and file.filename != '':
                        # Validate file extension
                        if not allowed_file(file.filename):
                            # Clean up any already uploaded files
                            for path in temp_file_paths.values():
                                if os.path.exists(path):
                                    os.remove(path)
                            if os.path.exists(temp_session_folder):
                                os.rmdir(temp_session_folder)
                            return jsonify({"error": f"Invalid file type for {file_key}. Allowed extensions: {', '.join(Config.ALLOWED_EXTENSIONS)}"}), 400

                        # Read file data for validation
                        file_data = file.read()
                        file_size = len(file_data)

                        # Validate file size (5MB max for images)
                        if file_size > MAX_IMAGE_SIZE:
                            # Clean up any already uploaded files
                            for path in temp_file_paths.values():
                                if os.path.exists(path):
                                    os.remove(path)
                            if os.path.exists(temp_session_folder):
                                os.rmdir(temp_session_folder)
                            return jsonify({"error": f"File {file_key} too large. Maximum size: 5MB"}), 400

                        # Determine MIME type
                        import mimetypes
                        mime_type, _ = mimetypes.guess_type(file.filename)
                        if not mime_type:
                            mime_type = 'application/octet-stream'

                        # For image files, validate MIME type
                        if file_key in ['photo', 'signature', 'passport_front_img', 'passport_back_img', 'cdc_img', 'coc_img']:
                            if mime_type not in ALLOWED_IMAGE_TYPES:
                                # Clean up any already uploaded files
                                for path in temp_file_paths.values():
                                    if os.path.exists(path):
                                        os.remove(path)
                                if os.path.exists(temp_session_folder):
                                    os.rmdir(temp_session_folder)
                                return jsonify({"error": f"Invalid image type for {file_key}. Allowed: JPEG, PNG"}), 400

                        # Secure filename and create temp filename with field key prefix
                        from werkzeug.utils import secure_filename
                        filename = secure_filename(file.filename)
                        ext = filename.rsplit('.', 1)[1] if '.' in filename else ''
                        temp_filename = f"{file_key}.{ext}" if ext else file_key

                        # Check for duplicate temp filenames in same session
                        temp_file_path = f"{temp_session_folder}/{temp_filename}"
                        if os.path.exists(temp_file_path):
                            # Clean up any already uploaded files
                            for path in temp_file_paths.values():
                                if os.path.exists(path):
                                    os.remove(path)
                            if os.path.exists(temp_session_folder):
                                os.rmdir(temp_session_folder)
                            return jsonify({"error": f"Duplicate filename {temp_filename} in session"}), 400

                        # Save file to temp session folder
                        with open(temp_file_path, 'wb') as f:
                            f.write(file_data)

                        uploaded_files[file_key] = temp_filename
                        temp_file_paths[file_key] = temp_file_path
                        print(f"[TEMP STORAGE] Saved {file_key}: {temp_filename} to {temp_file_path}")
        except Exception as file_error:
            # Clean up on any file processing error
            for path in temp_file_paths.values():
                if os.path.exists(path):
                    os.remove(path)
            if os.path.exists(temp_session_folder):
                os.rmdir(temp_session_folder)
            return jsonify({"error": f"File processing error: {str(file_error)}"}), 500

        # Perform OCR on passport and CDC images (skip if disabled)
        ocr_data = {}

        if Config.ENABLE_OCR:
            try:
                # Extract passport front data
                if 'passport_front_img' in temp_file_paths:
                    ocr_data['passport_front'] = extract_passport_front_data(temp_file_paths['passport_front_img'])

                # Extract passport back data
                if 'passport_back_img' in temp_file_paths:
                    ocr_data['passport_back'] = extract_passport_back_data(temp_file_paths['passport_back_img'])

                # Extract CDC data if provided
                if 'cdc_img' in temp_file_paths:
                    ocr_data['cdc'] = extract_cdc_data(temp_file_paths['cdc_img'])
                else:
                    ocr_data['cdc'] = {"cdc_no": "", "indos_no": ""}

            except Exception as ocr_error:
                print(f"[OCR] Error during OCR processing: {ocr_error}")
                # Continue with placeholder data
                ocr_data['passport_front'] = {"name": "", "passport_no": "", "date_of_birth": "", "place_of_birth": "", "date_of_issue": "", "date_of_expiry": "", "place_of_issue": ""}
                ocr_data['passport_back'] = {"address": "", "emergency_contact": ""}
                ocr_data['cdc'] = {"cdc_no": "", "indos_no": ""}
        else:
            print("[OCR] OCR processing disabled - skipping AI extraction")
            # Create placeholder OCR data when OCR is disabled
            ocr_data['passport_front'] = {"name": "", "passport_no": "", "date_of_birth": "", "place_of_birth": "", "date_of_issue": "", "date_of_expiry": "", "place_of_issue": ""}
            ocr_data['passport_back'] = {"address": "", "emergency_contact": ""}
            ocr_data['cdc'] = {"cdc_no": "", "indos_no": ""}

        # Add session information to OCR data
        ocr_data['session_id'] = session_id
        ocr_data['uploaded_files'] = uploaded_files
        ocr_data['temp_file_paths'] = temp_file_paths
        ocr_data['timestamp'] = datetime.now().strftime("%Y%m%d_%H%M%S")
        ocr_data['last_updated'] = datetime.now().isoformat()
        ocr_data['ocr_enabled'] = Config.ENABLE_OCR

        print(f"[TEMP STORAGE] Images stored temporarily for session: {session_id}")
        for file_key, filename in uploaded_files.items():
            print(f"[TEMP STORAGE] {file_key}: {filename}")

        return jsonify({
            "status": "success",
            "message": "Images uploaded and stored temporarily" + (" with OCR processing" if Config.ENABLE_OCR else " (OCR disabled)"),
            "data": ocr_data,
            "session_id": session_id,
            "json_file": None,  # Not used in new implementation
            "files_processed": len(uploaded_files),
            "ocr_enabled": Config.ENABLE_OCR,
            "storage_type": "temp_folder"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@upload_bp.route('/upload-payment-screenshot', methods=['POST', 'OPTIONS'])
def upload_payment_screenshot():
    """Upload payment screenshot to session temp folder"""
    try:
        if 'paymentScreenshot' not in request.files:
            return jsonify({"error": "No payment screenshot provided"}), 400

        if 'sessionId' not in request.form:
            return jsonify({"error": "Session ID required"}), 400

        file = request.files['paymentScreenshot']
        session_id = request.form['sessionId']

        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Validate file type (images only)
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Only images allowed"}), 400

        # Save to session temp folder
        temp_session_folder = f"{Config.TEMP_FOLDER}/{session_id}"
        if not os.path.exists(temp_session_folder):
            return jsonify({"error": "Invalid session ID or session expired"}), 400

        from werkzeug.utils import secure_filename
        filename = secure_filename(file.filename)
        file_path = f"{temp_session_folder}/{filename}"
        file.save(file_path)

        print(f"[PAYMENT UPLOAD] Saved payment screenshot: {filename} to session {session_id}")

        return jsonify({
            "status": "success",
            "message": "Payment screenshot uploaded successfully",
            "filename": filename,
            "session_id": session_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@upload_bp.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    """Legacy upload endpoint for backward compatibility"""
    if 'pdf' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    from werkzeug.utils import secure_filename
    filename = secure_filename(file.filename)
    file_path = f"{Config.UPLOAD_FOLDER}/{filename}"
    file.save(file_path)

    try:
        from utils.drive import upload_to_drive
        drive_link = upload_to_drive(file_path, filename)
        from utils.qr import generate_qr_code
        qr_path, qr_base64 = generate_qr_code(drive_link, filename)

        return jsonify({
            "success": True,
            "status": "success",
            "drive_link": drive_link,
            "qr_image": qr_base64,
            "filename": filename,
            "storage_type": "google_drive"
        }), 200

    except Exception as e:
        # Fallback to local storage
        local_link = f"http://localhost:5000/download-pdf/{filename}"
        from utils.qr import generate_qr_code
        qr_path, qr_base64 = generate_qr_code(local_link, filename)

        return jsonify({
            "success": True,
            "status": "success",
            "drive_link": local_link,
            "qr_image": qr_base64,
            "filename": filename,
            "storage_type": "local",
            "warning": f"Google Drive upload failed: {str(e)}"
        }), 200

@upload_bp.route('/test-ocr', methods=['POST'])
def test_ocr():
    """Test OCR functionality with a single image"""
    try:
        if not Config.ENABLE_OCR:
            return jsonify({
                "status": "disabled",
                "message": "OCR endpoints are disabled. Enable by setting Config.ENABLE_OCR = True or export ENABLE_OCR=true in backend .env"
            }), 503
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save temporary file
        from werkzeug.utils import secure_filename
        filename = secure_filename(file.filename)
        temp_path = f"{Config.UPLOAD_FOLDER}/temp_{filename}"
        file.save(temp_path)

        # Perform OCR
        text = pytesseract.image_to_string(Image.open(temp_path))

        # Clean up - but protect PDF files
        if not temp_path.lower().endswith('.pdf'):
            os.remove(temp_path)
            print(f"[CLEANUP] Removed temp file: {temp_path}")
        else:
            print(f"[CLEANUP] Protected PDF file from deletion: {temp_path}")

        return jsonify({
            "status": "success",
            "extracted_text": text
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@upload_bp.route('/test-chatgpt-ocr', methods=['POST'])
def test_chatgpt_ocr():
    """Test ChatGPT OCR filtering with sample text"""
    try:
        if not Config.ENABLE_OCR:
            return jsonify({
                "status": "disabled",
                "message": "OCR endpoints are disabled. Enable by setting Config.ENABLE_OCR = True or export ENABLE_OCR=true in backend .env"
            }), 503
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        raw_text = data.get('text', '')
        doc_type = data.get('type', 'passport_front')

        if not raw_text:
            return jsonify({"error": "No text provided"}), 400

        if doc_type not in ['passport_front', 'passport_back', 'cdc']:
            return jsonify({"error": "Invalid document type. Use: passport_front, passport_back, or cdc"}), 400

        from utils.chatgpt import filter_text_with_chatgpt
        result = filter_text_with_chatgpt(raw_text, doc_type)

        return jsonify({
            "status": "success",
            "document_type": doc_type,
            "extracted_data": result,
            "raw_text_preview": raw_text[:200] + "..." if len(raw_text) > 200 else raw_text,
            "chatgpt_enabled": Config.ENABLE_CHATGPT_FILTERING,
            "api_key_configured": bool(Config.OPENAI_API_KEY and Config.OPENAI_API_KEY != "your_openai_api_key_here")
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@upload_bp.route('/image/<int:image_id>', methods=['GET'])
def get_image(image_id):
    """
    Retrieve and serve an image from the database by its ID
    """
    try:
        # Query for the image data
        result = execute_query("""
            SELECT file_data, mime_type, file_name
            FROM candidate_uploads
            WHERE id = %s AND file_data IS NOT NULL
        """, (image_id,))

        if not result:
            return jsonify({"error": "Image not found"}), 404

        file_data = result[0]['file_data']
        mime_type = result[0]['mime_type'] or 'application/octet-stream'
        file_name = result[0]['file_name'] or f'image_{image_id}'

        # Return the image with appropriate headers
        from flask import Response
        response = Response(file_data, mimetype=mime_type)
        response.headers['Content-Disposition'] = f'inline; filename="{file_name}"'
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500