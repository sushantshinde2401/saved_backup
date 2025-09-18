from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config

certificate_bp = Blueprint('certificate', __name__)

@certificate_bp.route('/save-certificate-data', methods=['POST'])
def save_certificate_data():
    """Save certificate data to certificate_selections_for_receipt.json for receipt processing"""
    try:
        data = request.get_json()

        # Extract required fields
        firstName = data.get('firstName', '')
        lastName = data.get('lastName', '')
        certificateName = data.get('certificateName', '')
        companyName = data.get('companyName', '')
        rateData = data.get('rateData', {})

        if not firstName or not lastName or not certificateName:
            return jsonify({"error": "firstName, lastName, and certificateName are required"}), 400

        # Path to certificate selections file
        certificate_selections_path = f"{Config.JSON_FOLDER}/certificate_selections_for_receipt.json"

        # Load existing certificate selections or create empty array
        certificate_selections = []
        if os.path.exists(certificate_selections_path):
            try:
                with open(certificate_selections_path, 'r') as json_file:
                    certificate_selections = json.load(json_file)
                    if not isinstance(certificate_selections, list):
                        certificate_selections = []
            except (json.JSONDecodeError, Exception) as e:
                print(f"[WARNING] Error reading existing certificate selections, starting fresh: {e}")
                certificate_selections = []

        # Check for duplicates (same firstName + lastName + certificateName)
        duplicate_found = False
        for existing_cert in certificate_selections:
            if (existing_cert.get('firstName') == firstName and
                existing_cert.get('lastName') == lastName and
                existing_cert.get('certificateName') == certificateName):
                duplicate_found = True
                break

        if duplicate_found:
            return jsonify({
                "status": "warning",
                "message": f"Certificate already exists for {firstName} {lastName} - {certificateName}",
                "duplicate": True
            }), 200

        # Generate course-specific ID based on certificate name
        def generate_course_id(certificate_name, existing_certificates):
            # Map certificate names to prefixes
            course_prefixes = {
                'Basic Safety Training (STCW)': 'stcw',
                'H2S Training': 'h2s',
                'BOSIET Training': 'bosiet',
                'MODU Survival Training': 'modu',
                'Advanced Fire Fighting': 'aff',
                'Medical First Aid': 'mfa',
                'Personal Survival Techniques': 'pst',
                'Personal Safety and Social Responsibilities': 'pssr'
            }

            # Get prefix for the course
            prefix = course_prefixes.get(certificate_name, 'cert')

            # Count existing certificates with same prefix
            count = 1
            for cert in existing_certificates:
                if cert.get('id', '').startswith(f"{prefix}_"):
                    try:
                        existing_num = int(cert.get('id', '').split('_')[1])
                        if existing_num >= count:
                            count = existing_num + 1
                    except (ValueError, IndexError):
                        continue

            return f"{prefix}_{count:03d}"

        # Calculate amount from rate data if company is provided
        amount = 0
        if companyName and rateData and companyName in rateData:
            company_rates = rateData.get(companyName, {})
            amount = company_rates.get(certificateName, 0)

        # Check if this is a new candidate (different from existing certificates)
        current_candidate = f"{firstName.upper()} {lastName.upper()}"
        existing_candidates = set()

        for existing_cert in certificate_selections:
            existing_candidate = f"{existing_cert.get('firstName', '').upper()} {existing_cert.get('lastName', '').upper()}"
            existing_candidates.add(existing_candidate)

        # If this is a new candidate, clear all existing certificates
        is_new_candidate = len(existing_candidates) > 0 and current_candidate not in existing_candidates
        if is_new_candidate:
            print(f"[JSON] New candidate detected: {current_candidate}")
            print(f"[JSON] Clearing existing certificates for previous candidates: {existing_candidates}")
            certificate_selections = []  # Clear all existing certificates

        # Check for duplicates within current candidate's certificates
        duplicate_found = False
        for existing_cert in certificate_selections:
            if (existing_cert.get('firstName', '').upper() == firstName.upper() and
                existing_cert.get('lastName', '').upper() == lastName.upper() and
                existing_cert.get('certificateName', '') == certificateName):
                duplicate_found = True
                break

        if duplicate_found:
            print(f"[JSON] Duplicate certificate found for current candidate: {firstName} {lastName} - {certificateName}")
            return jsonify({
                "status": "success",
                "message": "Certificate already exists for current candidate",
                "duplicate": True,
                "total_certificates": len(certificate_selections)
            }), 200

        # Generate unique course-based ID (recalculate after potential clearing)
        unique_id = generate_course_id(certificateName, certificate_selections)

        # Create new certificate entry with enhanced structure
        certificate_entry = {
            'id': unique_id,  # Course-specific unique ID
            'firstName': firstName,
            'lastName': lastName,
            'certificateName': certificateName,
            'companyName': companyName,  # Use provided company name
            'amount': amount,            # Use calculated amount from rate list
            'timestamp': datetime.now().isoformat()
        }

        # Append to existing array
        certificate_selections.append(certificate_entry)

        # Save updated array back to file
        with open(certificate_selections_path, 'w') as json_file:
            json.dump(certificate_selections, json_file, indent=2)

        print(f"[JSON] Added certificate selection: {firstName} {lastName} - {certificateName}")

        return jsonify({
            "status": "success",
            "message": "Certificate data saved for receipt processing",
            "filename": "certificate_selections_for_receipt.json",
            "data": certificate_entry,
            "total_certificates": len(certificate_selections)
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to save certificate data: {e}")
        return jsonify({"error": str(e)}), 500

@certificate_bp.route('/get-certificate-selections-for-receipt', methods=['GET'])
def get_certificate_selections_for_receipt():
    """Get certificate selections for receipt processing"""
    try:
        certificate_selections_path = f"{Config.JSON_FOLDER}/certificate_selections_for_receipt.json"

        # Return empty array if file doesn't exist
        if not os.path.exists(certificate_selections_path):
            print("[JSON] Certificate selections file not found, returning empty array")
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No certificate selections found"
            }), 200

        # Load and return certificate selections
        with open(certificate_selections_path, 'r') as json_file:
            certificate_selections = json.load(json_file)

            # Ensure it's a list
            if not isinstance(certificate_selections, list):
                certificate_selections = []

        print(f"[JSON] Retrieved {len(certificate_selections)} certificate selections for receipt processing")

        return jsonify({
            "status": "success",
            "data": certificate_selections,
            "total_certificates": len(certificate_selections)
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get certificate selections: {e}")
        return jsonify({"error": str(e)}), 500

@certificate_bp.route('/update-certificate-company-data', methods=['POST'])
def update_certificate_company_data():
    """Update certificate selections with company name and amount data"""
    try:
        data = request.get_json()

        # Extract required fields
        certificate_ids = data.get('certificateIds', [])
        company_name = data.get('companyName', '')
        rate_data = data.get('rateData', {})

        if not certificate_ids or not company_name:
            return jsonify({"error": "certificateIds and companyName are required"}), 400

        # Path to certificate selections file
        certificate_selections_path = f"{Config.JSON_FOLDER}/certificate_selections_for_receipt.json"

        if not os.path.exists(certificate_selections_path):
            return jsonify({"error": "Certificate selections file not found"}), 404

        # Load certificate selections
        with open(certificate_selections_path, 'r') as json_file:
            certificate_selections = json.load(json_file)

        if not isinstance(certificate_selections, list):
            return jsonify({"error": "Invalid certificate selections format"}), 400

        # Update certificates with company and amount data
        updated_count = 0
        for cert in certificate_selections:
            if cert.get('id') in certificate_ids:
                cert['companyName'] = company_name

                # Get amount from rate data
                certificate_name = cert.get('certificateName', '')
                company_rates = rate_data.get(company_name, {})
                cert['amount'] = company_rates.get(certificate_name, 0)

                updated_count += 1

        # Save updated data
        with open(certificate_selections_path, 'w') as json_file:
            json.dump(certificate_selections, json_file, indent=2)

        print(f"[JSON] Updated {updated_count} certificates with company: {company_name}")

        return jsonify({
            "status": "success",
            "message": f"Updated {updated_count} certificates with company data",
            "updated_count": updated_count,
            "company_name": company_name
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to update certificate company data: {e}")
        return jsonify({"error": str(e)}), 500

@certificate_bp.route('/delete-certificate-selection', methods=['DELETE'])
def delete_certificate_selection():
    """Delete a certificate selection by ID"""
    try:
        data = request.get_json()
        certificate_id = data.get('id', '')

        if not certificate_id:
            return jsonify({"error": "Certificate ID is required"}), 400

        # Path to certificate selections file
        certificate_selections_path = f"{Config.JSON_FOLDER}/certificate_selections_for_receipt.json"

        if not os.path.exists(certificate_selections_path):
            return jsonify({"error": "Certificate selections file not found"}), 404

        # Load certificate selections
        with open(certificate_selections_path, 'r') as json_file:
            certificate_selections = json.load(json_file)

        if not isinstance(certificate_selections, list):
            return jsonify({"error": "Invalid certificate selections format"}), 400

        # Find and remove the certificate
        original_count = len(certificate_selections)
        certificate_selections = [cert for cert in certificate_selections if cert.get('id') != certificate_id]

        if len(certificate_selections) == original_count:
            return jsonify({"error": "Certificate not found"}), 404

        # Save updated data
        with open(certificate_selections_path, 'w') as json_file:
            json.dump(certificate_selections, json_file, indent=2)

        print(f"[JSON] Deleted certificate selection: {certificate_id}")

        return jsonify({
            "status": "success",
            "message": "Certificate selection deleted successfully",
            "deleted_id": certificate_id,
            "remaining_count": len(certificate_selections)
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to delete certificate selection: {e}")
        return jsonify({"error": str(e)}), 500

@certificate_bp.route('/update-certificate-selection', methods=['PUT'])
def update_certificate_selection():
    """Update a specific field in a certificate selection"""
    try:
        data = request.get_json()
        certificate_id = data.get('id', '')
        field = data.get('field', '')
        value = data.get('value', '')

        if not certificate_id or not field:
            return jsonify({"error": "Certificate ID and field are required"}), 400

        # Path to certificate selections file
        certificate_selections_path = f"{Config.JSON_FOLDER}/certificate_selections_for_receipt.json"

        if not os.path.exists(certificate_selections_path):
            return jsonify({"error": "Certificate selections file not found"}), 404

        # Load certificate selections
        with open(certificate_selections_path, 'r') as json_file:
            certificate_selections = json.load(json_file)

        if not isinstance(certificate_selections, list):
            return jsonify({"error": "Invalid certificate selections format"}), 400

        # Find and update the certificate
        updated = False
        for cert in certificate_selections:
            if cert.get('id') == certificate_id:
                # Handle different field mappings
                if field == 'candidateName':
                    # Split candidate name into firstName and lastName
                    name_parts = value.split(' ', 1)
                    cert['firstName'] = name_parts[0] if len(name_parts) > 0 else ''
                    cert['lastName'] = name_parts[1] if len(name_parts) > 1 else ''
                elif field == 'sales':
                    cert['amount'] = value
                else:
                    cert[field] = value
                updated = True
                break

        if not updated:
            return jsonify({"error": "Certificate not found"}), 404

        # Save updated data
        with open(certificate_selections_path, 'w') as json_file:
            json.dump(certificate_selections, json_file, indent=2)

        print(f"[JSON] Updated certificate selection {certificate_id}: {field} = {value}")

        return jsonify({
            "status": "success",
            "message": "Certificate selection updated successfully",
            "updated_id": certificate_id,
            "field": field,
            "value": value
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to update certificate selection: {e}")
        return jsonify({"error": str(e)}), 500