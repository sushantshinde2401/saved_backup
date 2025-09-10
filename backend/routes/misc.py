from flask import Blueprint, request, jsonify, send_from_directory
from datetime import datetime, timedelta
import os
import shutil
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config
from utils.drive import upload_to_drive
from utils.qr import generate_qr_code

misc_bp = Blueprint('misc', __name__)

@misc_bp.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "Document Processing Server is running",
        "timestamp": datetime.now().isoformat()
    })

@misc_bp.route('/cleanup-expired-sessions', methods=['POST'])
def cleanup_expired_sessions():
    """Clean up temporary session folders older than specified hours"""
    try:
        hours_old = request.json.get('hours_old', 24) if request.json else 24  # Default 24 hours
        cutoff_time = datetime.now() - timedelta(hours=hours_old)

        cleaned_folders = []
        errors = []

        if os.path.exists(Config.TEMP_FOLDER):
            for session_folder in os.listdir(Config.TEMP_FOLDER):
                session_path = f"{Config.TEMP_FOLDER}/{session_folder}"

                if os.path.isdir(session_path):
                    folder_mtime = datetime.fromtimestamp(os.path.getmtime(session_path))

                    if folder_mtime < cutoff_time:
                        try:
                            shutil.rmtree(session_path)
                            cleaned_folders.append(session_folder)
                            print(f"[CLEANUP] Removed expired session: {session_folder}")
                        except Exception as e:
                            errors.append(f"Failed to remove {session_folder}: {str(e)}")

        return jsonify({
            "status": "success",
            "message": f"Cleanup completed. Removed {len(cleaned_folders)} expired sessions",
            "cleaned_folders": cleaned_folders,
            "errors": errors
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@misc_bp.route('/save-pdf', methods=['POST'])
def save_pdf():
    """Save generated PDF and upload to Google Drive"""
    try:
        if 'pdf' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400

        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save PDF locally
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        from werkzeug.utils import secure_filename
        filename = secure_filename(pdf_file.filename)
        name, ext = os.path.splitext(filename)
        filename = f"{timestamp}_{name}{ext}"

        pdf_path = f"{Config.PDFS_FOLDER}/{filename}"
        pdf_file.save(pdf_path)

        try:
            # Upload to Google Drive
            drive_link = upload_to_drive(pdf_path, filename)

            # Generate QR code
            qr_path, qr_base64 = generate_qr_code(drive_link, filename)

            return jsonify({
                "success": True,
                "status": "success",
                "drive_link": drive_link,
                "qr_image": qr_base64,
                "filename": filename,
                "storage_type": "google_drive"
            }), 200

        except Exception as drive_error:
            # If Google Drive upload fails, still save locally
            print(f"Google Drive upload failed: {drive_error}")

            # Generate local link and QR code
            local_link = f"http://localhost:5000/download-pdf/{filename}"
            qr_path, qr_base64 = generate_qr_code(local_link, filename)

            return jsonify({
                "success": True,
                "status": "success",
                "drive_link": local_link,
                "qr_image": qr_base64,
                "filename": filename,
                "storage_type": "local",
                "warning": "Google Drive upload failed, file saved locally"
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@misc_bp.route('/save-right-pdf', methods=['POST'])
def save_right_pdf():
    """Save right PDF locally only (no Google Drive, no QR generation)"""
    try:
        if 'pdf' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400

        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save PDF locally only
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        from werkzeug.utils import secure_filename
        filename = secure_filename(pdf_file.filename)
        name, ext = os.path.splitext(filename)
        filename = f"{timestamp}_{name}{ext}"

        pdf_path = f"{Config.PDFS_FOLDER}/{filename}"
        pdf_file.save(pdf_path)

        print(f"[SUCCESS] Right PDF saved locally: {pdf_path}")

        return jsonify({
            "success": True,
            "status": "success",
            "local_link": f"http://localhost:5000/download-pdf/{filename}",
            "filename": filename,
            "message": "Right PDF saved to backend successfully"
        }), 200

    except Exception as e:
        print(f"[ERROR] Error saving right PDF: {e}")
        return jsonify({"error": str(e)}), 500

@misc_bp.route('/download-pdf/<filename>', methods=['GET'])
def download_pdf(filename):
    """Download PDF file"""
    try:
        return send_from_directory(Config.PDFS_FOLDER, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@misc_bp.route('/list-files', methods=['GET'])
def list_files():
    """List all uploaded files"""
    try:
        files = {
            "images": os.listdir(Config.IMAGES_FOLDER),
            "json": os.listdir(Config.JSON_FOLDER),
            "pdfs": os.listdir(Config.PDFS_FOLDER)
        }
        return jsonify({
            "status": "success",
            "files": files
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@misc_bp.route('/get-company-accounts', methods=['GET'])
def get_company_accounts():
    """Get company account numbers for payment entries"""
    try:
        from shared.utils import get_all_company_accounts

        accounts = get_all_company_accounts()

        # If no accounts from database, return mock data
        if not accounts:
            print("[MOCK] Database not available, returning mock company accounts")
            mock_accounts = [
                {
                    "id": 1,
                    "company_name": "ANGEL SEAFARER DOCUMENTATION PRIVATE LIMITED",
                    "account_number": "101-2103-4948",
                    "bank_name": "IDFC FIRST BANK"
                },
                {
                    "id": 2,
                    "company_name": "ANGEL MARITIME ACADEMY PRIVATE LIMITED",
                    "account_number": "101-4881-6551",
                    "bank_name": "IDFC FIRST BANK"
                },
                {
                    "id": 3,
                    "company_name": "Moreshwar Shipping Services",
                    "account_number": "10188909073",
                    "bank_name": "IDFC FIRST BANK"
                },
                {
                    "id": 4,
                    "company_name": "BALLALESHWAR SHIPPING SERVICES",
                    "account_number": "10191830765",
                    "bank_name": "IDFC FIRST BANK"
                },
                {
                    "id": 5,
                    "company_name": "SIDDHIVINAYAK MARINE CONSULTANCY",
                    "account_number": "83699905961",
                    "bank_name": "IDFC FIRST BANK"
                }
            ]
            return jsonify({
                "status": "success",
                "data": mock_accounts
            }), 200

        return jsonify({
            "status": "success",
            "data": accounts
        }), 200
    except Exception as e:
        print(f"[ERROR] Database error: {e}")
        # Return mock data as fallback
        mock_accounts = [
            {
                "id": 1,
                "company_name": "ANGEL SEAFARER DOCUMENTATION PRIVATE LIMITED",
                "account_number": "101-2103-4948",
                "bank_name": "IDFC FIRST BANK"
            },
            {
                "id": 2,
                "company_name": "ANGEL MARITIME ACADEMY PRIVATE LIMITED",
                "account_number": "101-4881-6551",
                "bank_name": "IDFC FIRST BANK"
            },
            {
                "id": 3,
                "company_name": "Moreshwar Shipping Services",
                "account_number": "10188909073",
                "bank_name": "IDFC FIRST BANK"
            },
            {
                "id": 4,
                "company_name": "BALLALESHWAR SHIPPING SERVICES",
                "account_number": "10191830765",
                "bank_name": "IDFC FIRST BANK"
            },
            {
                "id": 5,
                "company_name": "SIDDHIVINAYAK MARINE CONSULTANCY",
                "account_number": "83699905961",
                "bank_name": "IDFC FIRST BANK"
            }
        ]
        return jsonify({
            "status": "success",
            "data": mock_accounts
        }), 200

@misc_bp.route('/get-company-details/<account_number>', methods=['GET'])
def get_company_details(account_number):
    """Get company details by account number"""
    try:
        from shared.utils import get_company_details_by_account

        company_details = get_company_details_by_account(account_number)

        # If no details from database, return mock data based on account number
        if not company_details:
            print(f"[MOCK] Database not available, returning mock data for account: {account_number}")

            mock_data = {
                "101-2103-4948": {
                    "company_name": "ANGEL SEAFARER DOCUMENTATION PRIVATE LIMITED",
                    "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                    "company_gst_number": "27AAYCA0004D1Z0",
                    "bank_name": "IDFC FIRST BANK",
                    "account_number": "101-2103-4948",
                    "branch": "Belapur",
                    "ifsc_code": "IDFB0040172",
                    "swift_code": "IDFB IN BB MUM"
                },
                "101-4881-6551": {
                    "company_name": "ANGEL MARITIME ACADEMY PRIVATE LIMITED",
                    "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                    "company_gst_number": "27AAZCA2020J1ZI",
                    "bank_name": "IDFC FIRST BANK",
                    "account_number": "101-4881-6551",
                    "branch": "Belapur",
                    "ifsc_code": "IDFB0040172",
                    "swift_code": None
                },
                "10188909073": {
                    "company_name": "Moreshwar Shipping Services",
                    "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                    "company_gst_number": None,
                    "bank_name": "IDFC FIRST BANK",
                    "account_number": "10188909073",
                    "branch": "APMC Vashi (Branch Code - 40193)",
                    "ifsc_code": "IDFB0040193",
                    "swift_code": None
                },
                "10191830765": {
                    "company_name": "BALLALESHWAR SHIPPING SERVICES",
                    "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                    "company_gst_number": None,
                    "bank_name": "IDFC FIRST BANK",
                    "account_number": "10191830765",
                    "branch": "Navi Mumbai-Vashi APMC Branch",
                    "ifsc_code": "IDFB 0040193",
                    "swift_code": None
                },
                "83699905961": {
                    "company_name": "SIDDHIVINAYAK MARINE CONSULTANCY",
                    "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                    "company_gst_number": None,
                    "bank_name": "IDFC FIRST BANK",
                    "account_number": "83699905961",
                    "branch": "VASHI -APMC BRANCH",
                    "ifsc_code": "IDFB0040193",
                    "swift_code": None
                }
            }

            if account_number in mock_data:
                return jsonify({
                    "status": "success",
                    "data": mock_data[account_number]
                }), 200
            else:
                return jsonify({
                    "status": "error",
                    "error": "Company not found"
                }), 404

        return jsonify({
            "status": "success",
            "data": company_details
        }), 200
    except Exception as e:
        print(f"[ERROR] Database error: {e}")
        # Return mock data as fallback
        mock_data = {
            "101-2103-4948": {
                "company_name": "ANGEL SEAFARER DOCUMENTATION PRIVATE LIMITED",
                "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                "company_gst_number": "27AAYCA0004D1Z0",
                "bank_name": "IDFC FIRST BANK",
                "account_number": "101-2103-4948",
                "branch": "Belapur",
                "ifsc_code": "IDFB0040172",
                "swift_code": "IDFB IN BB MUM"
            },
            "101-4881-6551": {
                "company_name": "ANGEL MARITIME ACADEMY PRIVATE LIMITED",
                "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                "company_gst_number": "27AAZCA2020J1ZI",
                "bank_name": "IDFC FIRST BANK",
                "account_number": "101-4881-6551",
                "branch": "Belapur",
                "ifsc_code": "IDFB0040172",
                "swift_code": None
            },
            "10188909073": {
                "company_name": "Moreshwar Shipping Services",
                "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                "company_gst_number": None,
                "bank_name": "IDFC FIRST BANK",
                "account_number": "10188909073",
                "branch": "APMC Vashi (Branch Code - 40193)",
                "ifsc_code": "IDFB0040193",
                "swift_code": None
            },
            "10191830765": {
                "company_name": "BALLALESHWAR SHIPPING SERVICES",
                "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                "company_gst_number": None,
                "bank_name": "IDFC FIRST BANK",
                "account_number": "10191830765",
                "branch": "Navi Mumbai-Vashi APMC Branch",
                "ifsc_code": "IDFB 0040193",
                "swift_code": None
            },
            "83699905961": {
                "company_name": "SIDDHIVINAYAK MARINE CONSULTANCY",
                "company_address": "SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614",
                "company_gst_number": None,
                "bank_name": "IDFC FIRST BANK",
                "account_number": "83699905961",
                "branch": "VASHI -APMC BRANCH",
                "ifsc_code": "IDFB0040193",
                "swift_code": None
            }
        }

        if account_number in mock_data:
            return jsonify({
                "status": "success",
                "data": mock_data[account_number]
            }), 200
        else:
            return jsonify({
                "status": "error",
                "error": "Company not found"
            }), 404

@misc_bp.route('/get-customers', methods=['GET'])
def get_customers():
    """Get customers for payment entries"""
    try:
        # For now, return mock data. In production, query from customers table
        mock_customers = [
            {"id": 1, "name": "John Doe Enterprises", "type": "B2B", "gst": "GST123456789", "email": "john@doe.com"},
            {"id": 2, "name": "Jane Smith Corp", "type": "B2B", "gst": "GST987654321", "email": "jane@smith.com"},
            {"id": 3, "name": "Retail Customer", "type": "B2C", "gst": "", "email": "retail@example.com"}
        ]

        return jsonify({
            "status": "success",
            "data": mock_customers
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Error handlers
@misc_bp.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large"}), 413

@misc_bp.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@misc_bp.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500