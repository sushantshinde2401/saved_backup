from flask import Blueprint, request, jsonify
from datetime import datetime
import pytesseract
from PIL import Image
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config
from utils.file_ops import allowed_file, generate_session_id
from ocr.passport import extract_passport_front_data, extract_passport_back_data
from ocr.cdc import extract_cdc_data

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload-images', methods=['POST', 'OPTIONS'])
def upload_images():
    """
    Handle multiple file uploads and perform OCR processing
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

        # Create temporary session folder
        temp_session_folder = f"{Config.TEMP_FOLDER}/{session_id}"
        import os
        os.makedirs(temp_session_folder, exist_ok=True)

        # Save uploaded files to temporary session folder
        saved_files = {}

        for file_key in ['photo', 'signature', 'passport_front_img', 'passport_back_img', 'cdc_img', 'marksheet']:
            if file_key in request.files:
                file = request.files[file_key]
                if file and file.filename != '' and allowed_file(file.filename):
                    # Keep original filename for temp storage
                    from werkzeug.utils import secure_filename
                    filename = secure_filename(file.filename)

                    # Save to temp session folder
                    file_path = f"{temp_session_folder}/{filename}"
                    file.save(file_path)
                    saved_files[file_key] = file_path

                    print(f"[TEMP UPLOAD] Saved {file_key}: {filename} to session {session_id}")

        # Perform OCR on passport and CDC images
        if not Config.ENABLE_OCR:
            return jsonify({
                "status": "disabled",
                "message": "OCR endpoints are disabled. Enable by setting Config.ENABLE_OCR = True or export ENABLE_OCR=true in backend .env"
            }), 503
        ocr_data = {}

        # Extract passport front data
        if 'passport_front_img' in saved_files:
            ocr_data['passport_front'] = extract_passport_front_data(saved_files['passport_front_img'])

        # Extract passport back data
        if 'passport_back_img' in saved_files:
            ocr_data['passport_back'] = extract_passport_back_data(saved_files['passport_back_img'])

        # Extract CDC data if provided
        if 'cdc_img' in saved_files:
            ocr_data['cdc'] = extract_cdc_data(saved_files['cdc_img'])
        else:
            ocr_data['cdc'] = {"cdc_no": "", "indos_no": ""}

        # Add session information to OCR data
        ocr_data['session_id'] = session_id
        ocr_data['temp_folder'] = temp_session_folder
        ocr_data['uploaded_files'] = {
            key: os.path.basename(path) for key, path in saved_files.items()
        }
        ocr_data['timestamp'] = datetime.now().strftime("%Y%m%d_%H%M%S")
        ocr_data['last_updated'] = datetime.now().isoformat()

        # Save OCR data to JSON file with session ID
        json_filename = f"structured_passport_data_{session_id}.json"
        json_path = f"{Config.JSON_FOLDER}/{json_filename}"
        import json
        with open(json_path, 'w') as json_file:
            json.dump(ocr_data, json_file, indent=2)

        print(f"[JSON] Saved OCR data: {json_filename}")
        print(f"[TEMP STORAGE] Files saved to session folder: {session_id}")
        for file_key, file_path in saved_files.items():
            print(f"[TEMP STORAGE] {file_key}: {os.path.basename(file_path)}")

        return jsonify({
            "status": "success",
            "message": "Files uploaded and processed successfully",
            "data": ocr_data,
            "session_id": session_id,
            "json_file": json_filename,
            "files_processed": len(saved_files),
            "temp_folder": temp_session_folder
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

        # Clean up
        os.remove(temp_path)

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