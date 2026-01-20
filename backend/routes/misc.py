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
                        # Check if folder contains PDF files - protect them from automatic deletion
                        contains_pdf = False
                        try:
                            for filename in os.listdir(session_path):
                                if filename.lower().endswith('.pdf'):
                                    contains_pdf = True
                                    break
                        except Exception as e:
                            print(f"[CLEANUP] Error checking folder contents {session_folder}: {e}")
                            errors.append(f"Error checking {session_folder}: {str(e)}")
                            continue

                        if contains_pdf:
                            print(f"[CLEANUP] Skipped session {session_folder} - contains PDF files")
                            continue

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
        print(f"[PDF SAVE] Saving PDF to: {pdf_path}")
        pdf_file.save(pdf_path)
        print(f"[PDF SAVE] Successfully saved PDF: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")

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
        print(f"[PDF SAVE] Saving right PDF to: {pdf_path}")

        # Ensure the directory exists
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

        pdf_file.save(pdf_path)
        print(f"[PDF SAVE] Successfully saved right PDF: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
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

@misc_bp.route('/legacy-certificates', methods=['POST'])
def add_legacy_certificate():
    """Add or update legacy certificate records"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        # Extract fields
        candidate_name = data.get('candidate_name', '').strip()
        passport = data.get('passport', '').strip()
        certificate_name = data.get('certificate_name', '').strip()
        certificate_number = data.get('certificate_number', '').strip()
        start_date = data.get('start_date', '').strip()
        end_date = data.get('end_date', '').strip()
        issue_date = data.get('issue_date', '').strip()
        expiry_date = data.get('expiry_date', '').strip()

        # Validate required fields
        if not certificate_number:
            return jsonify({"status": "error", "message": "certificate_number is required"}), 400
        if not candidate_name:
            return jsonify({"status": "error", "message": "candidate_name is required"}), 400
        if not passport:
            return jsonify({"status": "error", "message": "passport is required"}), 400

        # Validate dates
        try:
            from datetime import datetime
            start_date_obj = datetime.fromisoformat(start_date) if start_date else None
            end_date_obj = datetime.fromisoformat(end_date) if end_date else None
            issue_date_obj = datetime.fromisoformat(issue_date) if issue_date else None
            expiry_date_obj = datetime.fromisoformat(expiry_date) if expiry_date else None

            if not all([start_date_obj, end_date_obj, issue_date_obj, expiry_date_obj]):
                return jsonify({"status": "error", "message": "All date fields are required"}), 400

            if start_date_obj > end_date_obj:
                return jsonify({"status": "error", "message": "start_date must be before or equal to end_date"}), 400
            if issue_date_obj > expiry_date_obj:
                return jsonify({"status": "error", "message": "issue_date must be before or equal to expiry_date"}), 400

        except ValueError:
            return jsonify({"status": "error", "message": "Invalid date format"}), 400

        # Import execute_query
        from database import execute_query

        # Check if record exists
        check_query = "SELECT id FROM legacy_certificates WHERE certificate_number = %s"
        existing = execute_query(check_query, (certificate_number,), fetch=True)

        if existing:
            # Update existing record
            update_query = """
                UPDATE legacy_certificates
                SET candidate_name = %s, passport = %s, certificate_name = %s,
                    start_date = %s, end_date = %s, issue_date = %s, expiry_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE certificate_number = %s
            """
            execute_query(update_query, (
                candidate_name, passport, certificate_name,
                start_date, end_date, issue_date, expiry_date,
                certificate_number
            ), fetch=False)
            return jsonify({"status": "updated", "message": "Record already existed — data updated successfully"}), 200
        else:
            # Insert new record
            insert_query = """
                INSERT INTO legacy_certificates
                (candidate_name, passport, certificate_name, certificate_number,
                 start_date, end_date, issue_date, expiry_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            execute_query(insert_query, (
                candidate_name, passport, certificate_name, certificate_number,
                start_date, end_date, issue_date, expiry_date
            ), fetch=False)
            return jsonify({"status": "inserted", "message": "New certificate added successfully"}), 201

    except Exception as e:
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500


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