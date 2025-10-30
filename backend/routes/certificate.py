from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import os
import sys
import base64
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config
from database.db_connection import execute_query
from hooks.post_data_insert import update_master_table_after_certificate_insert

certificate_bp = Blueprint('certificate', __name__)



@certificate_bp.route('/create-receipt-invoice-table', methods=['POST'])
def create_receipt_invoice_table():
    """Check receipt invoice table status"""
    try:
        from database.db_connection import execute_query

        # Check if tables exist
        check_query = """
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('receiptinvoicedata', 'receiptamountreceived')
        """

        result = execute_query(check_query)
        existing_tables = [row['table_name'] for row in result] if result else []

        return jsonify({
            "status": "success",
            "message": "Receipt invoice tables status checked",
            "existing_tables": existing_tables,
            "tables_exist": len(existing_tables) == 2
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@certificate_bp.route('/save-certificate-data', methods=['POST'])
def save_certificate_data():
    """Save certificate data with images to certificate_selections table"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract required fields
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        passport = data.get('passport')
        client_name = data.get('clientName')
        certificate_name = data.get('certificateName')
        verification_image_data = data.get('verificationImageData')
        certificate_image_data = data.get('certificateImageData')

        if not all([first_name, last_name, passport, certificate_name]):
            return jsonify({"error": "Missing required fields: firstName, lastName, passport, certificateName"}), 400

        # Get candidate data from candidates table
        # Database stores names with underscores, not spaces
        candidate_name = f"{first_name}_{last_name}_{passport}"
        get_candidate_query = """
            SELECT id, candidate_name FROM candidates
            WHERE candidate_name = %s
            LIMIT 1
        """

        candidate_result = execute_query(get_candidate_query, (candidate_name,), fetch=True)
        if not candidate_result:
            return jsonify({"error": f"Candidate '{candidate_name}' not found in database"}), 404

        candidate_id = candidate_result[0]['id']
        candidate_name_db = candidate_result[0]['candidate_name']

        # Check for duplicate certificate
        check_duplicate_query = """
            SELECT id FROM certificate_selections
            WHERE candidate_id = %s AND certificate_name = %s
        """
        duplicate_result = execute_query(check_duplicate_query, (candidate_id, certificate_name), fetch=True)

        if duplicate_result:
            return jsonify({
                "duplicate": True,
                "message": "Certificate already exists for this candidate"
            }), 200

        # Convert base64 images to bytes
        verification_image_bytes = None
        certificate_image_bytes = None

        if verification_image_data:
            try:
                # Remove data URL prefix if present
                if verification_image_data.startswith('data:image/'):
                    verification_image_data = verification_image_data.split(',')[1]
                verification_image_bytes = base64.b64decode(verification_image_data)
            except Exception as e:
                # Silently handle image decoding errors
                verification_image_bytes = None

        if certificate_image_data:
            try:
                # Remove data URL prefix if present
                if certificate_image_data.startswith('data:image/'):
                    certificate_image_data = certificate_image_data.split(',')[1]
                certificate_image_bytes = base64.b64decode(certificate_image_data)
            except Exception as e:
                # Silently handle image decoding errors
                certificate_image_bytes = None

        # Insert into certificate_selections table
        insert_query = """
            INSERT INTO certificate_selections
            (candidate_id, candidate_name, client_name, certificate_name, verification_image, certificate_image)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        insert_result = execute_query(insert_query, (
            candidate_id,
            candidate_name_db,
            client_name,
            certificate_name,
            verification_image_bytes,
            certificate_image_bytes
        ), fetch=True)

        if insert_result:
            certificate_selection_id = insert_result[0]['id']

            # Update Master_Database_Table_A automatically
            from hooks.post_data_insert import update_master_table_after_certificate_insert
            update_master_table_after_certificate_insert(candidate_id)

            # Get total count for response
            count_query = "SELECT COUNT(*) as total FROM certificate_selections"
            count_result = execute_query(count_query, fetch=True)
            total_certificates = count_result[0]['total'] if count_result else 0

            return jsonify({
                "status": "success",
                "message": "Certificate data saved successfully",
                "data": {
                    "id": certificate_selection_id,
                    "candidate_id": candidate_id,
                    "candidate_name": candidate_name_db,
                    "client_name": client_name,
                    "certificate_name": certificate_name,
                    "has_images": bool(verification_image_bytes or certificate_image_bytes)
                },
                "total_certificates": total_certificates
            }), 200
        else:
            return jsonify({"error": "Failed to insert certificate data"}), 500

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500


@certificate_bp.route('/get-certificate-selections-for-receipt', methods=['GET'])
def get_certificate_selections_for_receipt():
    """Get all certificate selections for receipt processing, aggregated by candidate"""
    try:
        # First, get all certificate selections
        query = """
            SELECT
                cs.id,
                cs.candidate_id,
                cs.candidate_name,
                cs.client_name,
                cs.certificate_name,
                cs.creation_date,
                CASE WHEN cs.verification_image IS NOT NULL THEN true ELSE false END as has_verification_image,
                CASE WHEN cs.certificate_image IS NOT NULL THEN true ELSE false END as has_certificate_image
            FROM certificate_selections cs
            ORDER BY cs.client_name, cs.candidate_name, cs.creation_date DESC
        """

        result = execute_query(query, fetch=True)

        if not result:
            return jsonify({
                "status": "success",
                "data": [],
                "total": 0
            }), 200

        # Aggregate certificates by candidate_id
        aggregated_data = {}
        for row in result:
            candidate_id = row['candidate_id']
            if candidate_id not in aggregated_data:
                aggregated_data[candidate_id] = {
                    'candidate_id': candidate_id,
                    'candidate_name': row['candidate_name'],
                    'client_name': row['client_name'],
                    'certificates': [],
                    'creation_date': row['creation_date'],
                    'has_verification_image': row['has_verification_image'],
                    'has_certificate_image': row['has_certificate_image'],
                    'certificate_count': 0
                }

            # Add certificate to the list
            aggregated_data[candidate_id]['certificates'].append({
                'id': row['id'],
                'certificate_name': row['certificate_name'],
                'creation_date': row['creation_date'],
                'has_verification_image': row['has_verification_image'],
                'has_certificate_image': row['has_certificate_image']
            })

            # Update counts
            aggregated_data[candidate_id]['certificate_count'] += 1

        # Convert to list and sort by client_name, candidate_name
        aggregated_list = list(aggregated_data.values())
        aggregated_list.sort(key=lambda x: (x['client_name'], x['candidate_name']))

        # Debug: Log the structure of the first few results (commented out to prevent terminal output)
        # print(f"[CERTIFICATE] Raw query results (first 3): {result[:3] if result else 'None'}")

        return jsonify({
            "status": "success",
            "data": aggregated_list,
            "total": len(aggregated_list),
            "total_certificates": len(result)
        }), 200

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500


@certificate_bp.route('/delete-certificate-selection', methods=['DELETE'])
def delete_certificate_selection():
    """Delete a certificate selection by ID"""
    try:
        data = request.get_json()
        if not data or 'id' not in data:
            return jsonify({"error": "Certificate selection ID required"}), 400

        certificate_id = data['id']

        delete_query = "DELETE FROM certificate_selections WHERE id = %s RETURNING id"
        result = execute_query(delete_query, (certificate_id,), fetch=True)

        if result:
            return jsonify({
                "status": "success",
                "message": "Certificate selection deleted successfully"
            }), 200
        else:
            return jsonify({"error": "Certificate selection not found"}), 404

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500


@certificate_bp.route('/update-certificate-selection', methods=['PUT'])
def update_certificate_selection():
    """Update a certificate selection"""
    try:
        data = request.get_json()
        if not data or 'id' not in data:
            return jsonify({"error": "Certificate selection ID required"}), 400

        certificate_id = data['id']
        updates = []
        values = []

        # Build dynamic update query
        if 'certificate_name' in data:
            updates.append("certificate_name = %s")
            values.append(data['certificate_name'])

        if not updates:
            return jsonify({"error": "No fields to update"}), 400

        update_query = f"""
            UPDATE certificate_selections
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id
        """
        values.append(certificate_id)

        result = execute_query(update_query, tuple(values), fetch=True)

        if result:
            return jsonify({
                "status": "success",
                "message": "Certificate selection updated successfully"
            }), 200
        else:
            return jsonify({"error": "Certificate selection not found"}), 404

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500

@certificate_bp.route('/update-certificate-company-data', methods=['POST'])
def update_certificate_company_data():
    """Update certificate selections with company data"""
    try:
        data = request.get_json()
        # print(f"[CERTIFICATE] Received data: {data}")  # Commented out to prevent terminal output
        if not data or 'certificateIds' not in data or 'companyName' not in data:
            return jsonify({"error": "certificateIds and companyName are required"}), 400

        certificate_ids = data['certificateIds']
        company_name = data['companyName']
        rate_data = data.get('rateData', {})

        # print(f"[CERTIFICATE] certificate_ids: {certificate_ids}, company_name: {company_name}")  # Commented out to prevent terminal output

        if not isinstance(certificate_ids, list) or len(certificate_ids) == 0:
            return jsonify({"error": "certificateIds must be a non-empty list"}), 400

        # Update client_name for the specified certificates
        # Use IN clause instead of ANY() for better compatibility
        if len(certificate_ids) == 1:
            # Single ID case
            update_query = """
                UPDATE certificate_selections
                SET client_name = %s
                WHERE id = %s
            """
            params = (company_name, certificate_ids[0])
        else:
            # Multiple IDs case - create placeholders
            placeholders = ','.join(['%s'] * len(certificate_ids))
            update_query = f"""
                UPDATE certificate_selections
                SET client_name = %s
                WHERE id IN ({placeholders})
            """
            params = (company_name,) + tuple(certificate_ids)

        # print(f"[CERTIFICATE] Executing query: {update_query}")  # Commented out to prevent terminal output
        # print(f"[CERTIFICATE] Parameters: {params}")  # Commented out to prevent terminal output
        try:
            result = execute_query(update_query, params, fetch=False)
            # print(f"[CERTIFICATE] Update result: {result}")  # Commented out to prevent terminal output
        except Exception as query_error:
            # print(f"[CERTIFICATE] Query execution error: {query_error}")  # Commented out to prevent terminal output
            raise

        return jsonify({
            "status": "success",
            "message": f"Updated {len(certificate_ids)} certificates with company: {company_name}",
            "updated_count": len(certificate_ids)
        }), 200

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500


@certificate_bp.route('/verification-image/<int:certificate_id>', methods=['GET'])
def get_verification_image(certificate_id):
    """Serve verification image from certificate_selections table"""
    try:
        from database.db_connection import execute_query

        result = execute_query("""
            SELECT verification_image, certificate_name
            FROM certificate_selections
            WHERE id = %s AND verification_image IS NOT NULL
        """, (certificate_id,))

        if not result:
            return jsonify({"error": "Verification image not found"}), 404

        image_data = result[0]['verification_image']
        certificate_name = result[0]['certificate_name'] or f'certificate_{certificate_id}'

        from flask import Response
        response = Response(image_data, mimetype='image/jpeg')
        response.headers['Content-Disposition'] = f'inline; filename="verification_{certificate_name}.jpg"'
        return response

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500

@certificate_bp.route('/certificate-image/<int:certificate_id>', methods=['GET'])
def get_certificate_image(certificate_id):
    """Serve certificate image from certificate_selections table"""
    try:
        from database.db_connection import execute_query

        result = execute_query("""
            SELECT certificate_image, certificate_name
            FROM certificate_selections
            WHERE id = %s AND certificate_image IS NOT NULL
        """, (certificate_id,))

        if not result:
            return jsonify({"error": "Certificate image not found"}), 404

        image_data = result[0]['certificate_image']
        certificate_name = result[0]['certificate_name'] or f'certificate_{certificate_id}'

        from flask import Response
        response = Response(image_data, mimetype='image/jpeg')
        response.headers['Content-Disposition'] = f'inline; filename="certificate_{certificate_name}.jpg"'
        return response

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500


@certificate_bp.route('/get-candidate-names-by-ids', methods=['POST'])
def get_candidate_names_by_ids():
    """Get candidate names by certificate IDs"""
    try:
        data = request.get_json()
        if not data or 'certificateIds' not in data:
            return jsonify({"error": "certificateIds required"}), 400

        certificate_ids = data['certificateIds']
        if not isinstance(certificate_ids, list) or len(certificate_ids) == 0:
            return jsonify({"error": "certificateIds must be a non-empty list"}), 400

        # Query to get candidate names for the given certificate IDs
        placeholders = ','.join(['%s'] * len(certificate_ids))
        query = f"""
            SELECT cs.id, cs.candidate_name, cs.certificate_name
            FROM certificate_selections cs
            WHERE cs.id IN ({placeholders})
        """

        result = execute_query(query, tuple(certificate_ids), fetch=True)

        if not result:
            return jsonify({
                "status": "success",
                "data": {},
                "message": "No certificates found"
            }), 200

        # Build response mapping ID to candidate name
        names_map = {}
        for row in result:
            names_map[row['id']] = {
                'candidate_name': row['candidate_name'],
                'certificate_name': row['certificate_name']
            }

        return jsonify({
            "status": "success",
            "data": names_map
        }), 200

    except Exception as e:
        # Silently handle errors to prevent terminal output
        return jsonify({"error": str(e)}), 500

