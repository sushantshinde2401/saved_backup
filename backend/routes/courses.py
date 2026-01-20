from flask import Blueprint, jsonify, request
from database import execute_query
import json
import logging
import os
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/courses', methods=['GET'])
def get_all_courses():
    """Get all courses for dropdown - returns course_id and course_name only"""
    try:
        query = "SELECT course_id, course_name FROM courses ORDER BY course_name"
        result = execute_query(query, fetch=True)

        courses = []
        for row in result:
            courses.append({
                'id': row['course_id'],
                'course_name': row['course_name']
            })

        logger.info(f"Retrieved {len(courses)} courses for dropdown")
        return jsonify(courses)

    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        return jsonify({'error': 'Failed to fetch courses'}), 500

@courses_bp.route('/courses/<course_id>', methods=['GET'])
def get_course_details(course_id):
    """Get course details by course_id - returns course_id, course_name and topics array"""
    try:
        query = "SELECT course_id, course_name, topics FROM courses WHERE course_id = %s"
        result = execute_query(query, (course_id,), fetch=True)

        if not result:
            return jsonify({'error': 'Course not found'}), 404

        course_id_result, course_name, topics_str = result[0]['course_id'], result[0]['course_name'], result[0]['topics']

        # Parse topics string into array
        topics = []
        if topics_str:
            # Try to parse as JSON first
            try:
                topics = json.loads(topics_str)
                if not isinstance(topics, list):
                    topics = [topics_str]
            except json.JSONDecodeError:
                # If not JSON, split by comma or newline
                topics = [topic.strip() for topic in topics_str.replace('\n', ',').split(',') if topic.strip()]

        course_data = {
            'course_id': course_id_result,
            'course_name': course_name,
            'topics': topics
        }

        logger.info(f"Retrieved details for course {course_id}: {course_name}")
        return jsonify(course_data)

    except Exception as e:
        logger.error(f"Error fetching course {course_id}: {e}")
        return jsonify({'error': 'Failed to fetch course details'}), 500

@courses_bp.route('/generate-certificate', methods=['POST'])
def generate_certificate():
    """Generate certificate with unified data mapping from candidate data and course metadata"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['course_id', 'course_name', 'topics', 'start_date', 'end_date', 'certificate_validity']

        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check if specific candidate is requested
        candidate_id = data.get('candidate_id')
        passport = data.get('passport')

        if candidate_id or passport:
            # Use specified candidate
            if candidate_id:
                candidate_query = """
                    SELECT id, candidate_name, json_data
                    FROM candidates
                    WHERE id = %s
                    LIMIT 1
                """
                candidate_result = execute_query(candidate_query, (candidate_id,), fetch=True)
                lookup_method = f"ID {candidate_id}"
            else:
                # Trim passport to handle any extra spaces
                trimmed_passport = passport.strip() if passport else ""
                candidate_query = """
                    SELECT id, candidate_name, json_data
                    FROM candidates
                    WHERE TRIM(json_data->>'passport') = %s
                    LIMIT 1
                """
                candidate_result = execute_query(candidate_query, (trimmed_passport,), fetch=True)
                lookup_method = f"passport {trimmed_passport}"

            if not candidate_result:
                return jsonify({'error': f'Candidate not found in database (looked up by {lookup_method})'}), 404

            candidate_row = candidate_result[0]
            candidate_json = candidate_row['json_data'] or {}
        else:
            # Use current candidate data (default behavior)
            import json
            current_candidate_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'json', 'current_candidate_for_certificate.json')

            if not os.path.exists(current_candidate_file):
                return jsonify({'error': 'No current candidate data found. Please submit candidate information first.'}), 404

            with open(current_candidate_file, 'r') as f:
                candidate_json = json.load(f)

            # Find candidate in database using passport number
            passport = candidate_json.get('passport', '').strip()
            if not passport:
                return jsonify({'error': 'Candidate passport number not found in current data'}), 400

            candidate_query = """
                SELECT id, candidate_name, json_data
                FROM candidates
                WHERE TRIM(json_data->>'passport') = %s
                LIMIT 1
            """
            candidate_result = execute_query(candidate_query, (passport,), fetch=True)

            if not candidate_result:
                return jsonify({
                    'error': f'Current candidate data contains passport "{passport}" which is not found in the database.',
                    'message': 'Please select a specific candidate from the dropdown or update the current candidate information.',
                    'action_required': 'select_candidate'
                }), 400

            candidate_row = candidate_result[0]
            candidate_id = candidate_row['id']
            candidate_json_db = candidate_row['json_data'] or {}
            # Merge current candidate data with database data
            candidate_json = {**candidate_json_db, **candidate_json}

        # Extract candidate fields from json_data
        first_name = candidate_json.get('firstName', '')
        last_name = candidate_json.get('lastName', '')
        full_name = f"{first_name} {last_name}".strip()

        # Generate serial number atomically
        serial_query = "SELECT nextval('certificate_serial_seq') as serial_num"
        serial_result = execute_query(serial_query, fetch=True)
        serial_number_int = serial_result[0]['serial_num']
        serial_str = str(serial_number_int).zfill(4)  # 4-digit zero-padded

        # Calculate issue_date and expiry_date
        end_date_str = data['end_date']
        logger.info(f"Processing end_date: {end_date_str} (type: {type(end_date_str)})")

        # Handle both YYYY-MM-DD and DD-MM-YYYY formats for end_date
        try:
            if len(end_date_str) == 10 and end_date_str[4] == '-':
                # YYYY-MM-DD format
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                logger.info(f"Parsed end_date as YYYY-MM-DD: {end_date}")
            else:
                # DD-MM-YYYY format
                end_date = datetime.strptime(end_date_str, '%d-%m-%Y')
                logger.info(f"Parsed end_date as DD-MM-YYYY: {end_date}")
        except ValueError as e:
            logger.error(f"Invalid date format for end_date: {end_date_str}. Expected YYYY-MM-DD or DD-MM-YYYY")
            return jsonify({'error': f'Invalid end_date format: {end_date_str}. Use YYYY-MM-DD format.'}), 400

        # Generate issue_date in DDMMYY format for certificate number
        issue_date_ddmmyy = end_date.strftime('%d%m%y')  # DDMMYY format for certificate number
        # Generate issue_date in DD-MM-YYYY format for display
        issue_date_display = end_date.strftime('%d-%m-%Y')  # DD-MM-YYYY format for display
        logger.info(f"Generated issue_date DDMMYY: {issue_date_ddmmyy}, Display: {issue_date_display}")

        certificate_validity = int(data['certificate_validity'])
        expiry_date = end_date + relativedelta(years=certificate_validity) - timedelta(days=1)
        expiry_date_str = expiry_date.strftime('%d-%m-%Y')

        # Construct certificate_number using DDMMYY format
        course_id_str = str(data['course_id']).zfill(5)  # 5-digit zero-padded
        certificate_number = f"{course_id_str}{issue_date_ddmmyy}{serial_str}"

        # 2. Fetch images from candidate_uploads table (now using file paths)
        images_query = """
            SELECT image_type, file_path
            FROM candidate_uploads
            WHERE candidate_id = %s AND image_type IN ('photo', 'signature') AND file_path IS NOT NULL AND file_path != ''
        """
        images_result = execute_query(images_query, (candidate_id,), fetch=True)

        # Map images by type (load from file system and convert to base64)
        images = {}
        import base64
        from config import Config
        for row in images_result:
            image_type = row['image_type']
            file_path = row['file_path']
            if file_path:
                try:
                    # Construct full file path
                    full_file_path = os.path.join(Config.BASE_STORAGE_PATH, file_path)
                    if os.path.exists(full_file_path):
                        with open(full_file_path, 'rb') as f:
                            file_data = f.read()
                        # Convert to base64 string
                        images[image_type] = base64.b64encode(file_data).decode('utf-8')
                        logger.info(f"Loaded {image_type} from {full_file_path}")
                    else:
                        logger.warning(f"Image file not found: {full_file_path}")
                        images[image_type] = None
                except Exception as e:
                    logger.error(f"Error loading image {image_type} from {file_path}: {e}")
                    images[image_type] = None
            else:
                images[image_type] = None

        # 3. Map all data to fixed backend keys (ensure all values are strings)
        certificate_data = {
            'CERTIFICATE_NUM': str(certificate_number),
            'NAME': str(full_name),
            'PASSPORT': str(candidate_json.get('passport', '')),
            'NATIONALITY': str(candidate_json.get('nationality', '')),
            'DOB': str(candidate_json.get('dob', '')),
            'CDC': str(candidate_json.get('cdcNo', '')),
            'INDOS': str(candidate_json.get('indosNo', '')),
            'COC': str(candidate_json.get('cocNo', '')),
            'ISSUING_COUNTRY': str(candidate_json.get('countryOfIssue', '')),
            'GRADE': str(candidate_json.get('grade', '')),
            'ID_NO': str(candidate_json.get('idNo', '')),
            'COURSE_NAME': str(data['course_name']),
            'TOPICS': ', '.join(data['topics']) if isinstance(data['topics'], list) else str(data['topics']),
            'DATE_FROM': str(data['start_date']),
            'DATE_TO': str(data['end_date']),
            'DATE_ISSUE': str(issue_date_display),
            'DATE_EXPIRY': str(expiry_date_str),
            'PHOTO': images.get('photo', None),
            'SIGNATURE': images.get('signature', None),
            'QR_CODE': None  # Placeholder for QR code generation
        }

        logger.info(f"Certificate data mapped successfully for candidate ID: {candidate_id}, course: {data['course_name']}")

        # Generate PDF certificate
        try:
            from utils.document_generator import DocumentGenerator
            logger.info("Calling PDF generation...")
            documents = DocumentGenerator.generate_verification_and_certificate(certificate_data)
            logger.info(f"PDF generation returned: {documents}")

            if documents:
                logger.info(f"PDF certificate generated successfully: {documents}")

                # Save certificate data to database
                try:
                    # Get candidate name
                    candidate_name = candidate_row['candidate_name']

                    # Convert expiry date from dd-mm-yyyy to YYYY-MM-DD
                    if expiry_date_str and '-' in expiry_date_str:
                        day, month, year = expiry_date_str.split('-')
                        expiry_date_db = f"{year}-{month}-{day}"
                    else:
                        expiry_date_db = None

                    # Convert issue_date from DDMMYY to YYYY-MM-DD for DB
                    issue_date_db = f"20{issue_date_ddmmyy[4:6]}-{issue_date_ddmmyy[2:4]}-{issue_date_ddmmyy[0:2]}"

                    # File paths for storage (relative paths)
                    verification_file_path = f"uploads/certificates/{documents['verification_file']}"
                    certificate_file_path = f"uploads/certificates/{documents['certificate_file']}"

                    # Get client name from candidate data
                    client_name = candidate_json.get('clientName', '')

                    # Insert into certificate_selections table - include all available columns
                    insert_query = """
                        INSERT INTO certificate_selections
                        (candidate_id, candidate_name, client_name, certificate_name, certificate_number,
                         start_date, end_date, issue_date, expiry_date, verification_image, certificate_image, serial_number)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """

                    insert_result = execute_query(insert_query, (
                        candidate_id,
                        candidate_name,
                        client_name,
                        data['course_name'],
                        certificate_number,
                        data['start_date'],
                        data['end_date'],
                        issue_date_db,
                        expiry_date_db,
                        verification_file_path,
                        certificate_file_path,
                        serial_str
                    ), fetch=True)

                    if insert_result:
                        certificate_selection_id = insert_result[0]['id']
                        logger.info(f"Certificate selection saved with ID: {certificate_selection_id}")

                        # Update Master_Database_Table_A automatically
                        from hooks.post_data_insert import update_master_table_after_certificate_insert
                        update_master_table_after_certificate_insert(candidate_id)
                    else:
                        logger.error("Failed to save certificate data to database")

                except Exception as db_error:
                    logger.error(f"Error saving certificate data to database: {db_error}")
                    return jsonify({
                        'error': f'PDF certificates generated but database save failed: {str(db_error)}'
                    }), 500

                return jsonify({
                    'success': True,
                    'message': 'PDF certificate and verification generated successfully',
                    'certificate_data': certificate_data,
                    'candidate_id': candidate_id,
                    'serial_number': serial_str,
                    'certificate_number': certificate_number,
                    'issue_date': issue_date_display,
                    'expiry_date': expiry_date_str,
                    'documents': {
                        'verification_file': documents['verification_file'],
                        'certificate_file': documents['certificate_file'],
                        'download_urls': {
                            'verification': f'/api/download-pdf/{documents["verification_file"]}',
                            'certificate': f'/api/download-pdf/{documents["certificate_file"]}'
                        }
                    }
                })
            else:
                logger.error("PDF generation returned None")
                return jsonify({
                    'error': 'Failed to generate PDF certificate - generation returned None'
                }), 500
        except Exception as pdf_error:
            logger.error(f"PDF generation exception: {pdf_error}")
            import traceback
            logger.error(f"PDF generation traceback: {traceback.format_exc()}")
            return jsonify({
                'error': f'PDF generation failed: {str(pdf_error)}'
            }), 500

    except Exception as e:
        logger.error(f"Error generating certificate: {e}")
        return jsonify({'error': 'Failed to generate certificate'}), 500


@courses_bp.route('/download-pdf/<filename>', methods=['GET'])
def download_pdf(filename):
    """Download generated PDF certificate"""
    try:
        from flask import send_file
        import os

        # Security check - only allow pdf files
        if not filename.endswith('.pdf'):
            return jsonify({'error': 'Invalid file type'}), 400

        # Path to the generated certificates
        current_dir = os.path.dirname(__file__)  # backend/routes/
        backend_dir = os.path.dirname(current_dir)  # backend/
        upload_dir = os.path.join(backend_dir, 'uploads', 'certificates')
        file_path = os.path.join(upload_dir, filename)

        logger.info(f"PDF download request for: {filename}")
        logger.info(f"Upload dir: {upload_dir}")
        logger.info(f"Full file path: {file_path}")
        logger.info(f"File exists: {os.path.exists(file_path)}")

        if not os.path.exists(file_path):
            return jsonify({'error': 'Certificate file not found'}), 404

        return send_file(file_path, as_attachment=True, download_name=filename, mimetype='application/pdf')

    except Exception as e:
        logger.error(f"Error downloading PDF {filename}: {e}")
        return jsonify({'error': 'Failed to download certificate'}), 500


@courses_bp.route('/verify', methods=['GET', 'OPTIONS'])
def verify_certificate():
    """Verify certificate by certificate number from QR code"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        from flask import Response
        response = Response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response, 200

    try:
        certificate_number = request.args.get('certificate_number')

        if not certificate_number:
            return jsonify({'error': 'Certificate number is required'}), 400

        logger.info(f"Verifying certificate: {certificate_number}")

        # Query certificate_selections table for the certificate
        query = """
            SELECT
                cs.id,
                cs.candidate_id,
                cs.candidate_name,
                cs.client_name,
                cs.certificate_name,
                cs.certificate_number,
                cs.start_date,
                cs.end_date,
                cs.issue_date,
                cs.expiry_date,
                cs.serial_number,
                cs.creation_date,
                c.json_data
            FROM certificate_selections cs
            LEFT JOIN candidates c ON cs.candidate_id = c.id
            WHERE cs.certificate_number = %s
            LIMIT 1
        """

        result = execute_query(query, (certificate_number,), fetch=True)

        if not result:
            return jsonify({
                'error': 'Certificate not found',
                'certificate_number': certificate_number,
                'message': 'This certificate number does not exist in our records.'
            }), 404

        certificate_data = result[0]

        # Parse candidate JSON data
        candidate_json = certificate_data.get('json_data', {}) or {}

        # Check if certificate is expired
        from datetime import datetime
        current_date = datetime.now().date()

        expiry_date = certificate_data.get('expiry_date')
        is_expired = False
        if expiry_date:
            try:
                # Handle different date formats
                if isinstance(expiry_date, str):
                    if len(expiry_date) == 10 and expiry_date[2] == '-' and expiry_date[5] == '-':
                        # DD-MM-YYYY format
                        expiry_date_obj = datetime.strptime(expiry_date, '%d-%m-%Y').date()
                    else:
                        # Assume YYYY-MM-DD format
                        expiry_date_obj = datetime.strptime(expiry_date, '%Y-%m-%d').date()
                else:
                    expiry_date_obj = expiry_date.date() if hasattr(expiry_date, 'date') else expiry_date

                is_expired = current_date > expiry_date_obj
            except Exception as e:
                logger.warning(f"Error parsing expiry date {expiry_date}: {e}")
                is_expired = False

        # Build verification response
        verification_data = {
            'certificate_number': certificate_data['certificate_number'],
            'candidate_name': certificate_data['candidate_name'],
            'client_name': certificate_data.get('client_name'),
            'certificate_name': certificate_data['certificate_name'],
            'passport': candidate_json.get('passport', ''),
            'nationality': candidate_json.get('nationality', ''),
            'start_date': certificate_data.get('start_date'),
            'end_date': certificate_data.get('end_date'),
            'issue_date': certificate_data.get('issue_date'),
            'expiry_date': certificate_data.get('expiry_date'),
            'serial_number': certificate_data.get('serial_number'),
            'is_valid': not is_expired,
            'is_expired': is_expired,
            'verification_date': current_date.strftime('%Y-%m-%d'),
            'status': 'EXPIRED' if is_expired else 'VALID'
        }

        logger.info(f"Certificate {certificate_number} verification: {'EXPIRED' if is_expired else 'VALID'}")

        return jsonify({
            'success': True,
            'verification': verification_data
        })

    except Exception as e:
        logger.error(f"Error verifying certificate {certificate_number}: {e}")
        return jsonify({'error': 'Failed to verify certificate'}), 500