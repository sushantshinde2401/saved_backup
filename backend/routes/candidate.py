from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime
import json
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config
from utils.file_ops import sanitize_folder_name, create_unique_candidate_folder, move_files_to_candidate_folder
from database import execute_query, get_candidate_by_name, save_candidate, Candidate
from database.db_connection import DatabaseConnection

candidate_bp = Blueprint('candidate', __name__)

# Initialize limiter for this blueprint
limiter = Limiter(key_func=get_remote_address)

@candidate_bp.route('/save-candidate-data', methods=['POST'])
@limiter.limit("5 per minute", override_defaults=False)  # Stricter limit for data submission
def save_candidate_data():
    """Save candidate form data and images atomically to database"""
    conn = None
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract candidate information and trim whitespace
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        passport_no = sanitize_folder_name(data.get('passport', '').strip())
        session_id = data.get('session_id', '')

        # Extract additional data
        ocr_data = data.get('ocr_data')
        payment_status = data.get('paymentStatus', '')
        payment_proof = data.get('paymentProof', '')

        # Validate required fields
        if not all([first_name, last_name, passport_no]):
            return jsonify({"error": "firstName, lastName, and passport are required"}), 400

        if not session_id:
            return jsonify({"error": "session_id is required"}), 400

        # Validate session_id format (should be UUID-like)
        import re
        if not re.match(r'^[a-f0-9\-]{36}$', session_id):
            return jsonify({"error": "Invalid session_id format"}), 400

        # Validate email format if provided
        email = data.get('email', '')
        if email and not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({"error": "Invalid email format"}), 400

        # Validate phone format if provided
        phone = data.get('phone', '')
        if phone and not re.match(r'^\+?[\d\s\-\(\)]{10,}$', phone):
            return jsonify({"error": "Invalid phone format"}), 400

        # Create candidate name - preserve spaces in names, only sanitize passport
        candidate_name = f"{first_name} {last_name}_{passport_no}"

        # Check if candidate name already exists
        existing_candidate = execute_query(
            "SELECT id FROM candidates WHERE candidate_name = %s",
            (candidate_name,)
        )
        if existing_candidate:
            return jsonify({"error": f"Candidate with name '{candidate_name}' already exists"}), 409

        # Check if temp session folder exists
        temp_session_folder = f"{Config.TEMP_FOLDER}/{session_id}"
        if not os.path.exists(temp_session_folder):
            return jsonify({"error": "Invalid session or session expired"}), 400

        # Get list of temp files
        temp_files = []
        for filename in os.listdir(temp_session_folder):
            file_path = os.path.join(temp_session_folder, filename)
            if os.path.isfile(file_path):
                temp_files.append(filename)

        print(f"[DEBUG] Found {len(temp_files)} temp files: {temp_files}")

        # Check for payment screenshot if payment status is PAID
        payment_screenshot_path = None
        if payment_status == 'PAID' and payment_proof:
            # Look for the payment screenshot in temp files
            for filename in temp_files:
                if filename == payment_proof:
                    payment_screenshot_path = os.path.join(temp_session_folder, filename)
                    break

            if not payment_screenshot_path:
                return jsonify({"error": f"Payment screenshot '{payment_proof}' not found in session"}), 400

        if not temp_files:
            return jsonify({"error": "No files found in session"}), 400

        # Start atomic transaction
        # DatabaseConnection and execute_query are now imported at the top
        conn = DatabaseConnection.get_connection()
        conn.autocommit = False  # Start transaction

        try:
            # Step 1: Insert candidate data FIRST to get candidate_id
            candidate_query = """
                INSERT INTO candidates (
                    candidate_name, session_id, json_data, ocr_data, last_updated
                ) VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (candidate_name)
                DO UPDATE SET
                    session_id = EXCLUDED.session_id,
                    json_data = EXCLUDED.json_data,
                    ocr_data = EXCLUDED.ocr_data,
                    last_updated = CURRENT_TIMESTAMP
                RETURNING id
            """

            import json
            candidate_result = execute_query(candidate_query, (
                candidate_name, session_id, json.dumps(data),
                json.dumps(ocr_data) if ocr_data else None
            ), fetch=True)

            if not candidate_result:
                raise Exception("Failed to insert candidate record")

            candidate_id = candidate_result[0]['id']
            print(f"[DB] ✅ Inserted candidate {candidate_name} with ID: {candidate_id}")

            # Step 2: Insert images into candidate_uploads table using candidate_id
            image_ids = []
            files_processed = 0

            # Mapping from field keys to image_type names
            field_to_type = {
                'photo': 'photo',
                'signature': 'signature',
                'passport_front_img': 'passport_front',
                'passport_back_img': 'passport_back',
                'cdc_img': 'cdc',
                'marksheet': 'marksheet',
                'coc_img': 'coc'
            }

            # First, handle payment screenshot if payment status is PAID
            if payment_status == 'PAID' and payment_screenshot_path:
                # Read payment screenshot file data
                with open(payment_screenshot_path, 'rb') as f:
                    file_data = f.read()

                file_size = len(file_data)
                file_type = payment_proof.rsplit('.', 1)[1].lower() if '.' in payment_proof else ''

                # Determine MIME type
                import mimetypes
                mime_type, _ = mimetypes.guess_type(payment_proof)
                if not mime_type:
                    mime_type = 'application/octet-stream'

                # Insert payment screenshot using candidate_id
                from database.db_connection import insert_image_blob  # Keep for now
                result = insert_image_blob(
                    candidate_id=candidate_id,
                    file_type=file_type,
                    file_data=file_data,
                    mime_type=mime_type,
                    file_size=file_size,
                    file_name=payment_proof,
                    image_type='payment',
                    candidate_name=candidate_name
                )

                if result:
                    image_ids.append(result)
                    files_processed += 1
                    print(f"[DB] ✅ Inserted payment screenshot {payment_proof} with ID: {result}")

            # Then process other images (no artificial limit)
            print(f"[DEBUG] Processing all remaining images from {len(temp_files)} total files")
            processed_additional = 0
            for filename in temp_files:  # Process all remaining images
                file_path = os.path.join(temp_session_folder, filename)

                # Skip the payment screenshot if it was already processed
                if payment_screenshot_path and filename == payment_proof:
                    print(f"[DEBUG] Skipping payment screenshot {filename} as already processed")
                    continue

                # Skip if we've already processed this file (avoid duplicates)
                if filename in [payment_proof] if payment_proof else []:
                    continue

                # Read file data
                with open(file_path, 'rb') as f:
                    file_data = f.read()

                file_size = len(file_data)
                file_type = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

                # Determine MIME type
                import mimetypes
                mime_type, _ = mimetypes.guess_type(filename)
                if not mime_type:
                    mime_type = 'application/octet-stream'

                # Determine image_type from filename prefix
                file_key = filename.split('.')[0]
                image_type = field_to_type.get(file_key, None)

                # Insert image using the new insert_image_blob function
                from database.db_connection import insert_image_blob  # Keep this for now - will migrate later
                result = insert_image_blob(
                    candidate_id=candidate_id,
                    file_type=file_type,
                    file_data=file_data,
                    mime_type=mime_type,
                    file_size=file_size,
                    file_name=filename,
                    image_type=image_type,
                    candidate_name=candidate_name
                )

                if result:
                    image_ids.append(result)
                    files_processed += 1
                    processed_additional += 1
                    print(f"[DB] ✅ Inserted image {filename} with image_type: {image_type}")

            print(f"[DEBUG] Processed {processed_additional} additional images. Total files_processed: {files_processed}")
            print(f"[DEBUG] Total images saved: {len(image_ids)} (should be {len(temp_files)} if no payment screenshot)")

            record_id = candidate_id

            # Commit transaction
            conn.commit()

            # Update Master_Database_Table_A automatically after candidate insertion
            try:
                from hooks.post_data_insert import update_master_table_after_candidate_insert
                update_master_table_after_candidate_insert(record_id)
                print(f"[MASTER_TABLE] Updated Master_Database_Table_A for candidate_id: {record_id}")
            except Exception as update_e:
                print(f"[MASTER_TABLE] Failed to update master table: {update_e}")
                # Don't fail the candidate creation if master table update fails

            # Step 3: Clean up temp folder
            import shutil
            shutil.rmtree(temp_session_folder)
            print(f"[CLEANUP] Removed temp session folder: {temp_session_folder}")

            print(f"[SUCCESS] ✅ Atomically saved candidate {candidate_name} with {len(image_ids)} images (including payment screenshot)")

            return jsonify({
                "status": "success",
                "message": "Candidate data and images saved atomically",
                "candidate_name": candidate_name,
                "record_id": record_id,
                "files_count": len(image_ids),
                "session_id": session_id,
                "filename": candidate_name,  # For frontend compatibility
                "storage_type": "separate_tables"
            }), 200

        except Exception as db_error:
            if conn:
                conn.rollback()
            print(f"[DB] ❌ Transaction failed: {db_error}")
            raise

    except Exception as e:
        print(f"[ERROR] Save candidate data failed: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)

@candidate_bp.route('/get-candidate-data/<filename>', methods=['GET'])
def get_candidate_data(filename):
    """Retrieve candidate data by filename"""
    try:
        json_path = f"{Config.JSON_FOLDER}/{filename}"

        if not os.path.exists(json_path):
            return jsonify({"error": "File not found"}), 404

        with open(json_path, 'r') as json_file:
            data = json.load(json_file)

        return jsonify({
            "status": "success",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@candidate_bp.route('/get-all-candidates', methods=['GET'])
def get_all_candidates():
    """Get all candidates with their images from separate tables"""
    try:
        # Query to get all candidates
        query = """
            SELECT
                c.id, c.candidate_name, c.session_id, c.json_data, c.created_at,
                c.ocr_data
            FROM candidates c
            ORDER BY c.created_at DESC
            LIMIT 1000
        """

        candidates = execute_query(query)

        if not candidates:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No candidates found in database",
                "total": 0
            }), 200

        # Format the results
        result = []
        for record in candidates:
            # Get images for this candidate
            files = []
            if record['id']:
                images_query = """
                    SELECT id, file_name, file_type, mime_type, file_size, upload_time, image_type
                    FROM candidate_uploads
                    WHERE candidate_id = %s AND file_path IS NOT NULL AND file_path != ''
                    ORDER BY upload_time
                    LIMIT 7
                """
                images = execute_query(images_query, (record['id'],))
                for i, img in enumerate(images):
                    files.append({
                        'id': img['id'],
                        'file_name': img['file_name'],
                        'file_type': img['file_type'],
                        'mime_type': img['mime_type'],
                        'file_size': img['file_size'],
                        'image_num': i + 1,
                        'upload_time': img['upload_time'].isoformat() if img['upload_time'] else None
                    })

            result.append({
                'id': record['id'],
                'candidate_name': record['candidate_name'],
                'session_id': record['session_id'],
                'candidate_data': record['json_data'] if record['json_data'] else {},
                'ocr_data': record['ocr_data'] if record['ocr_data'] else {},
                'files': files,
                'created_at': record['created_at'].isoformat() if record['created_at'] else None
            })

        return jsonify({
            "status": "success",
            "data": result,
            "message": f"Retrieved {len(result)} candidates from database",
            "total": len(result)
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get all candidates: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve candidates from database",
            "status": "error"
        }), 500

@candidate_bp.route('/search-candidates', methods=['GET'])
@limiter.limit("20 per minute")  # Moderate limit for search operations
def search_candidates():
    """Search candidates by name, email, passport, or candidate_name"""
    try:
        search_term = request.args.get('q', '').strip()
        search_field = request.args.get('field', 'firstName')  # firstName, lastName, email, passport, candidate_name

        if not search_term:
            return jsonify({
                "status": "error",
                "message": "Search term is required"
            }), 400

        # Search in candidates table
        if search_field == 'candidate_name':
            query = """
                SELECT id, candidate_name, session_id, json_data, created_at,
                       ocr_data
                FROM candidates
                WHERE candidate_name ILIKE %s
                ORDER BY created_at DESC
                LIMIT 50
            """
            params = (f"%{search_term}%",)
        else:
            query = f"""
                SELECT id, candidate_name, session_id, json_data, created_at,
                       ocr_data
                FROM candidates
                WHERE json_data->>'{search_field}' ILIKE %s
                ORDER BY created_at DESC
                LIMIT 50
            """
            params = (f"%{search_term}%",)

        results = execute_query(query, params)

        # Format results with images
        formatted_results = []
        for record in results:
            files = []
            if record['id']:
                images_query = """
                    SELECT id, file_name, file_type, mime_type, file_size, upload_time, image_type
                    FROM candidate_uploads
                    WHERE candidate_id = %s AND file_path IS NOT NULL AND file_path != ''
                    ORDER BY upload_time
                    LIMIT 7
                """
                images = execute_query(images_query, (record['id'],))
                for i, img in enumerate(images):
                    files.append({
                        'id': img['id'],
                        'file_name': img['file_name'],
                        'file_type': img['file_type'],
                        'mime_type': img['mime_type'],
                        'file_size': img['file_size'],
                        'image_num': i + 1,
                        'upload_time': img['upload_time'].isoformat() if img['upload_time'] else None
                    })

            formatted_results.append({
                'id': record['id'],
                'candidate_name': record['candidate_name'],
                'session_id': record['session_id'],
                'candidate_data': record['json_data'] if record['json_data'] else {},
                'ocr_data': record['ocr_data'] if record['ocr_data'] else {},
                'files': files,
                'created_at': record['created_at'].isoformat() if record['created_at'] else None
            })

        return jsonify({
            "status": "success",
            "data": formatted_results,
            "message": f"Found {len(formatted_results)} candidates matching '{search_term}' in {search_field}",
            "search_term": search_term,
            "search_field": search_field
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to search candidates: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to search candidates",
            "status": "error"
        }), 500

@candidate_bp.route('/get-current-candidate-for-certificate', methods=['GET'])
def get_current_candidate_for_certificate():
    """Get current candidate data for certificate generation from consolidated candidates table"""
    try:
        # execute_query is now imported at the top

        # For now, get the most recently created candidate as "current"
        # In the future, we might add an is_current_candidate column to candidates table
        result = execute_query("""
            SELECT json_data, candidate_name, created_at
            FROM candidates
            ORDER BY created_at DESC
            LIMIT 1
        """)

        if not result:
            print("[WARNING] No candidate data found in database")
            return jsonify({
                "error": "No candidate data found",
                "message": "Please complete the candidate details form first",
                "status": "not_found"
            }), 404

        candidate_record = result[0]
        # json_data is stored as JSONB, so it's already parsed as dict
        candidate_data = candidate_record['json_data'] if candidate_record['json_data'] else {}

        # Validate that the data contains required fields
        required_fields = ['firstName', 'lastName', 'passport']
        missing_fields = [field for field in required_fields if not candidate_data.get(field)]

        if missing_fields:
            print(f"[WARNING] Current candidate data missing required fields: {missing_fields}")
            return jsonify({
                "error": f"Incomplete candidate data - missing: {', '.join(missing_fields)}",
                "message": "Please complete the candidate details form with all required information",
                "status": "incomplete",
                "missing_fields": missing_fields
            }), 400

        print(f"[SUCCESS] Retrieved current candidate data from database: {candidate_data.get('firstName')} {candidate_data.get('lastName')}")
        return jsonify({
            "status": "success",
            "data": candidate_data,
            "message": "Current candidate data retrieved successfully",
            "source": "database"
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get current candidate for certificate: {e}")
        return jsonify({
            "error": str(e),
            "message": "Internal server error while retrieving candidate data",
            "status": "server_error"
        }), 500

@candidate_bp.route('/update-candidate-data', methods=['POST'])
def update_candidate_data():
    """Update existing candidate data by ID"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        candidate_id = data.get('id')
        if candidate_id is None:
            return jsonify({"error": "Candidate ID is required"}), 400

        try:
            candidate_id = int(candidate_id)
        except ValueError:
            return jsonify({"error": "Invalid candidate ID"}), 400

        # Remove id from data to update
        update_data = {k: v for k, v in data.items() if k != 'id'}

        # execute_query is now imported at the top

        # Check if candidate exists
        existing = execute_query("SELECT id FROM candidates WHERE id = %s", (candidate_id,))
        if not existing:
            return jsonify({"error": "Candidate not found"}), 404

        # Update the json_data field
        query = """
            UPDATE candidates
            SET json_data = %s, last_updated = CURRENT_TIMESTAMP
            WHERE id = %s
        """

        execute_query(query, (json.dumps(update_data), candidate_id), fetch=False)

        return jsonify({
            "status": "success",
            "message": "Candidate data updated successfully",
            "candidate_id": candidate_id
        }), 200

    except Exception as e:
        print(f"[ERROR] Update candidate data failed: {e}")
        return jsonify({"error": str(e)}), 500

@candidate_bp.route('/image/<int:candidate_id>/<int:image_num>', methods=['GET'])
def get_candidate_image(candidate_id, image_num):
    """
    Retrieve and serve an image from the candidate_uploads table by candidate ID and image number
    """
    try:
        from database.db_connection import execute_query

        # Validate image_num
        if image_num < 1 or image_num > 7:
            return jsonify({"error": "Invalid image number. Must be 1-7"}), 400

        # Check if candidate exists
        candidate_result = execute_query("""
            SELECT id FROM candidates WHERE id = %s
        """, (candidate_id,))

        if not candidate_result:
            return jsonify({"error": "Candidate not found"}), 404

        # Get the image from candidate_uploads ordered by upload_time
        result = execute_query("""
            SELECT file_path, file_name, mime_type
            FROM candidate_uploads
            WHERE candidate_id = %s AND file_path IS NOT NULL AND file_path != ''
            ORDER BY upload_time
            LIMIT 1 OFFSET %s
        """, (candidate_id, image_num - 1))

        if not result:
            return jsonify({"error": "Image not found"}), 404

        file_path = result[0]['file_path']
        file_name = result[0]['file_name'] or f'candidate_{candidate_id}_image_{image_num}'
        mime_type = result[0]['mime_type'] or 'application/octet-stream'

        # Load file from file system
        from config import Config
        full_file_path = os.path.join(Config.BASE_STORAGE_PATH, file_path)
        if not os.path.exists(full_file_path):
            return jsonify({"error": "Image file not found on disk"}), 404

        try:
            with open(full_file_path, 'rb') as f:
                file_data = f.read()
        except Exception as e:
            return jsonify({"error": f"Error reading image file: {str(e)}"}), 500

        # Return the image with appropriate headers
        from flask import Response
        response = Response(file_data, mimetype=mime_type)
        response.headers['Content-Disposition'] = f'inline; filename="{file_name}"'
        return response

    except Exception as e:
        print(f"[ERROR] Failed to get candidate image {candidate_id}/{image_num}: {e}")
@candidate_bp.route('/get-combined-candidate-data/<candidate_name>', methods=['GET'])
def get_combined_candidate_data(candidate_name):
    """
    Get combined candidate data from all sources: master_database_table_a, candidate_uploads,
    verification_image, and certificate_image from certificate_selections
    """
    try:
        from database.db_connection import execute_query

        # 1. Get data from master_database_table_a
        master_query = """
            SELECT
                creation_date, client_name, client_id, candidate_id, candidate_name,
                nationality, passport, cdcNo, indosNo, certificate_name, certificate_id,
                companyName, person_in_charge, delivery_note, delivery_date,
                terms_of_delivery, invoice_no
            FROM Master_Database_Table_A
            WHERE candidate_name = %s
            ORDER BY creation_date DESC
        """
        master_data = execute_query(master_query, (candidate_name,))

        # 2. Get candidate uploads data
        uploads_query = """
            SELECT
                id, candidate_name, file_name, file_type, mime_type,
                file_size, upload_time, image_type, candidate_id
            FROM candidate_uploads
            WHERE candidate_name = %s AND file_path IS NOT NULL AND file_path != ''
            ORDER BY upload_time DESC
        """
        uploads_data = execute_query(uploads_query, (candidate_name,))

        # 3. Get certificate selections with all columns
        cert_query = """
            SELECT cs.*
            FROM certificate_selections cs
            WHERE cs.candidate_name = %s
            ORDER BY cs.creation_date DESC
        """
        cert_data = execute_query(cert_query, (candidate_name,))

        # 4. Get basic candidate info from candidates table
        candidate_query = """
            SELECT
                c.id, c.candidate_name, c.session_id, c.json_data,
                c.created_at, c.last_updated
            FROM candidates c
            WHERE c.candidate_name = %s
            LIMIT 1
        """
        candidate_info = execute_query(candidate_query, (candidate_name,))

        # Combine all data
        combined_data = {
            'candidate_name': candidate_name,
            'master_data': master_data if master_data else [],
            'uploads': uploads_data if uploads_data else [],
            'certificates': cert_data if cert_data else [],
            'candidate_info': candidate_info[0] if candidate_info else None,
            'data_sources': {
                'master_table_records': len(master_data) if master_data else 0,
                'upload_files': len(uploads_data) if uploads_data else 0,
                'certificate_records': len(cert_data) if cert_data else 0,
                'has_candidate_info': bool(candidate_info)
            }
        }

        return jsonify({
            "status": "success",
            "data": combined_data,
            "message": f"Retrieved combined data for candidate '{candidate_name}'"
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get combined candidate data for {candidate_name}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve combined candidate data",
            "status": "error"
        }), 500

@candidate_bp.route('/get-unique-candidate-names', methods=['GET'])
def get_unique_candidate_names():
    """
    Get unique candidate names from all relevant tables for dropdown population
    """
    try:
        from database.db_connection import execute_query

        # Get unique candidate names from all sources
        query = """
            SELECT DISTINCT candidate_name
            FROM (
                SELECT candidate_name FROM Master_Database_Table_A
                UNION
                SELECT candidate_name FROM candidate_uploads
                UNION
                SELECT candidate_name FROM certificate_selections
                UNION
                SELECT candidate_name FROM candidates
            ) AS all_candidates
            WHERE candidate_name IS NOT NULL AND candidate_name != ''
            ORDER BY candidate_name
        """
        result = execute_query(query)

        candidate_names = [row['candidate_name'] for row in result] if result else []

        return jsonify({
            "status": "success",
            "data": candidate_names,
            "total": len(candidate_names),
            "message": f"Retrieved {len(candidate_names)} unique candidate names"
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get unique candidate names: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve candidate names",
            "status": "error"
        }), 500

@candidate_bp.route('/get-candidates-for-dropdown', methods=['GET'])
def get_candidates_for_dropdown():
    """
    Get candidates with id, name, and passport for dropdown selection
    """
    try:
        from database.db_connection import execute_query

        query = """
            SELECT id, candidate_name, TRIM(json_data->>'passport') as passport
            FROM candidates
            WHERE json_data->>'passport' IS NOT NULL AND TRIM(json_data->>'passport') != ''
            ORDER BY candidate_name
            LIMIT 1000
        """
        result = execute_query(query)

        candidates = []
        if result:
            for row in result:
                candidates.append({
                    'id': row['id'],
                    'candidate_name': row['candidate_name'],
                    'passport': row['passport']
                })

        return jsonify({
            "status": "success",
            "data": candidates,
            "total": len(candidates),
            "message": f"Retrieved {len(candidates)} candidates for dropdown"
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get candidates for dropdown: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve candidates for dropdown",
            "status": "error"
        }), 500
@candidate_bp.route('/download-image/<int:image_id>', methods=['GET'])
def download_image_by_id(image_id):
    """
    Download image from candidate_uploads table by ID
    """
    try:
        from database.db_connection import execute_query
        from flask import Response

        # Get image path from database
        result = execute_query("""
            SELECT file_path, file_name, mime_type
            FROM candidate_uploads
            WHERE id = %s AND file_path IS NOT NULL AND file_path != ''
        """, (image_id,))

        if not result:
            return jsonify({"error": "Image not found"}), 404

        file_path = result[0]['file_path']
        file_name = result[0]['file_name'] or f'image_{image_id}'
        mime_type = result[0]['mime_type'] or 'application/octet-stream'

        # Load file from file system
        from config import Config
        full_file_path = os.path.join(Config.BASE_STORAGE_PATH, file_path)
        if not os.path.exists(full_file_path):
            return jsonify({"error": "Image file not found on disk"}), 404

        try:
            with open(full_file_path, 'rb') as f:
                file_data = f.read()
        except Exception as e:
            return jsonify({"error": f"Error reading image file: {str(e)}"}), 500

        # Return the image with appropriate headers
        response = Response(file_data, mimetype=mime_type)
        response.headers['Content-Disposition'] = f'inline; filename="{file_name}"'
        return response

    except Exception as e:
        print(f"[ERROR] Failed to download image {image_id}: {e}")
        return jsonify({"error": str(e)}), 500
        return jsonify({"error": str(e)}), 500

@candidate_bp.route('/get-candidate-images/<int:candidate_id>', methods=['GET'])
def get_candidate_images(candidate_id):
    """
    Get all images for a specific candidate by candidate_id
    """
    try:
        from database.db_connection import get_candidate_images

        images = get_candidate_images(candidate_id)

        if not images:
            return jsonify({
                "status": "success",
                "data": [],
                "message": f"No images found for candidate {candidate_id}",
                "total": 0
            }), 200

        # Format the results
        formatted_images = []
        for img in images:
            formatted_images.append({
                'file_name': img['file_name'],
                'file_type': img['file_type'],
                'mime_type': img['mime_type'],
                'file_size': img['file_size'],
                'image_type': img['image_type'],
                'upload_time': img['upload_time'].isoformat() if img['upload_time'] else None,
                'download_url': f"/candidate/download-image/{img['id']}",  # Assuming we have this endpoint
                'file_path': img['file_path']  # Include file path for reference
            })

        return jsonify({
            "status": "success",
            "data": formatted_images,
            "message": f"Retrieved {len(formatted_images)} images for candidate {candidate_id}",
            "total": len(formatted_images)
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get candidate images for {candidate_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve candidate images",
            "status": "error"
        }), 500

@candidate_bp.route('/candidate-uploads', methods=['GET'])
def get_candidate_uploads():
    """
    Get candidate uploads with filtering and search for certificate editor
    Query params: candidate_id, candidate_name, search, limit, offset
    """
    try:
        from database.db_connection import execute_query
        import base64

        candidate_id = request.args.get('candidate_id', type=int)
        candidate_name = request.args.get('candidate_name', type=str)
        search = request.args.get('search', type=str)
        limit = min(request.args.get('limit', 20, type=int), 50)  # Default 20, max 50
        offset = request.args.get('offset', 0, type=int)

        # Build query conditions
        conditions = ["file_path IS NOT NULL AND file_path != ''"]
        params = []

        if candidate_id:
            # Get candidate_name from candidates table
            candidate_result = execute_query("SELECT candidate_name FROM candidates WHERE id = %s", (candidate_id,))
            if candidate_result:
                candidate_name = candidate_result[0]['candidate_name']

        if candidate_name:
            conditions.append("candidate_name = %s")
            params.append(candidate_name)

        if search:
            conditions.append("(file_name ILIKE %s OR file_type ILIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])

        where_clause = " AND ".join(conditions)

        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM candidate_uploads WHERE {where_clause}"
        count_result = execute_query(count_query, params)
        total = count_result[0]['total'] if count_result else 0

        # Get images with pagination
        query = f"""
            SELECT id, candidate_name, file_name, file_type, image_type, mime_type, file_size, upload_time
            FROM candidate_uploads
            WHERE {where_clause}
            ORDER BY upload_time DESC
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        results = execute_query(query, params)

        # Format results with base64 encoded thumbnails for drag functionality
        images = []
        for row in results:
            try:
                # Get file path for loading image data
                image_data = execute_query("SELECT file_path FROM candidate_uploads WHERE id = %s", (row['id'],))
                if image_data and image_data[0]['file_path']:
                    file_path = image_data[0]['file_path']
                    from config import Config
                    full_file_path = os.path.join(Config.BASE_STORAGE_PATH, file_path)
                    if os.path.exists(full_file_path):
                        with open(full_file_path, 'rb') as f:
                            file_data = f.read()
                        # Encode to base64
                        base64_data = base64.b64encode(file_data).decode('utf-8')
                        data_url = f"data:{row['mime_type'] or 'application/octet-stream'};base64,{base64_data}"

                        images.append({
                            'id': row['id'],
                            'file_name': row['file_name'],
                            'file_type': row['file_type'],
                            'image_type': row['image_type'],
                            'file_url': f"/candidate/download-image/{row['id']}",
                            'data_url': data_url,  # For drag and drop functionality
                            'mime_type': row['mime_type'],
                            'file_size': row['file_size'],
                            'upload_time': row['upload_time'].isoformat() if row['upload_time'] else None
                        })
                    else:
                        # File not found, fallback without base64 data
                        images.append({
                            'id': row['id'],
                            'file_name': row['file_name'],
                            'file_type': row['file_type'],
                            'image_type': row['image_type'],
                            'file_url': f"/candidate/download-image/{row['id']}",
                            'mime_type': row['mime_type'],
                            'file_size': row['file_size'],
                            'upload_time': row['upload_time'].isoformat() if row['upload_time'] else None
                        })
                else:
                    # No file path, fallback without base64 data
                    images.append({
                        'id': row['id'],
                        'file_name': row['file_name'],
                        'file_type': row['file_type'],
                        'image_type': row['image_type'],
                        'file_url': f"/candidate/download-image/{row['id']}",
                        'mime_type': row['mime_type'],
                        'file_size': row['file_size'],
                        'upload_time': row['upload_time'].isoformat() if row['upload_time'] else None
                    })
            except Exception as img_error:
                print(f"[WARNING] Failed to encode image {row['id']}: {img_error}")
                # Fallback without base64 data
                images.append({
                    'id': row['id'],
                    'file_name': row['file_name'],
                    'file_type': row['file_type'],
                    'image_type': row['image_type'],
                    'file_url': f"/candidate/download-image/{row['id']}",
                    'mime_type': row['mime_type'],
                    'file_size': row['file_size'],
                    'upload_time': row['upload_time'].isoformat() if row['upload_time'] else None
                })

        return jsonify({
            "status": "success",
            "data": images,
            "total": total,
            "limit": limit,
            "offset": offset,
            "message": f"Retrieved {len(images)} images"
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get candidate uploads: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve candidate uploads",
            "status": "error"
        }), 500 
@candidate_bp.route('/delete-candidate/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """Delete a candidate by ID"""
    try:
        # First check if candidate exists
        check_query = "SELECT id FROM candidates WHERE id = %s"
        check_result = execute_query(check_query, (candidate_id,))

        if not check_result:
            return jsonify({
                "error": "Candidate not found",
                "message": f"No candidate found with ID {candidate_id}",
                "status": "error"
            }), 404

        # Delete candidate uploads first (due to foreign key constraint)
        delete_uploads_query = "DELETE FROM candidate_uploads WHERE candidate_id = %s"
        execute_query(delete_uploads_query, (candidate_id,), fetch=False)

        # Delete the candidate
        delete_query = "DELETE FROM candidates WHERE id = %s"
        execute_query(delete_query, (candidate_id,), fetch=False)

        print(f"[DELETE] Successfully deleted candidate ID {candidate_id}")

        return jsonify({
            "status": "success",
            "message": f"Successfully deleted candidate ID {candidate_id}"
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to delete candidate {candidate_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete candidate",
            "status": "error"
        }), 500