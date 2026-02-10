"""
Database connection and operations module for PostgreSQL
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
import json
import os
from datetime import datetime
import logging
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConnection:
    """PostgreSQL database connection manager"""

    _pool = None

    @classmethod
    def get_pool(cls):
        """Get or create connection pool"""
        if cls._pool is None:
            try:
                cls._pool = SimpleConnectionPool(
                    minconn=1,
                    maxconn=10,
                    host=Config.DB_HOST,
                    port=Config.DB_PORT,
                    database=Config.DB_NAME,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    sslmode=Config.DB_SSL_MODE,
                    connect_timeout=Config.DB_CONNECTION_TIMEOUT
                )
                logger.info("[DB] Connection pool created successfully")
            except Exception as e:
                logger.error(f"[DB] Failed to create connection pool: {e}")
                raise
        return cls._pool

    @classmethod
    def get_connection(cls):
        """Get a database connection from the pool"""
        try:
            pool = cls.get_pool()
            conn = pool.getconn()
            conn.autocommit = False  # We'll manage transactions manually
            return conn
        except Exception as e:
            logger.error(f"[DB] Failed to get connection: {e}")
            raise

    @classmethod
    def return_connection(cls, conn):
        """Return connection to the pool"""
        if cls._pool and conn:
            cls._pool.putconn(conn)

    @classmethod
    def close_all(cls):
        """Close all connections in the pool"""
        if cls._pool:
            cls._pool.closeall()
            logger.info("[DB] All connections closed")

def execute_query(query, params=None, fetch=True):
    """
    Execute a database query with proper connection management

    Args:
        query (str): SQL query to execute
        params (tuple): Query parameters
        fetch (bool): Whether to fetch results

    Returns:
        list or None: Query results if fetch=True, None otherwise
    """
    conn = None
    try:
        conn = DatabaseConnection.get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params or ())

            # Detect DML/DDL statements that should be committed even when
            # using RETURNING (which requires fetch=True). We commit for
            # INSERT/UPDATE/DELETE/CREATE/DROP/ALTER statements.
            first_token = query.strip().split()[0].lower() if isinstance(query, str) and query.strip() else ''
            is_dml_or_ddl = first_token in ('insert', 'update', 'delete', 'create', 'drop', 'alter')

            if fetch:
                results = cursor.fetchall()
                # Commit if this was a DML/DDL that used RETURNING
                if is_dml_or_ddl:
                    conn.commit()
                return [dict(row) for row in results]
            else:
                # Non-fetching execution (e.g., plain INSERT/UPDATE/DELETE without RETURNING)
                conn.commit()
                return None

    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"[DB] Database error: {e}")
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"[DB] Unexpected error: {e}")
        raise
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)

def insert_candidate_upload(candidate_name, file_name, file_type, file_path, json_data):
    """
    Insert a new candidate upload record into the database

    Args:
        candidate_name (str): Name of the candidate
        file_name (str): Original filename
        file_type (str): File extension/type
        file_path (str): Full path to the file on disk
        json_data (dict): JSON data to store

    Returns:
        int: ID of the inserted record
    """
    query = """
        INSERT INTO candidate_uploads (candidate_name, file_name, file_type, file_path, json_data)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """

    try:
        result = execute_query(query, (candidate_name, file_name, file_type, file_path, json.dumps(json_data)))
        if result:
            record_id = result[0]['id']
            logger.info(f"[DB] Inserted candidate upload record ID: {record_id}")
            return record_id
        else:
            raise Exception("No ID returned from insert")
    except Exception as e:
        logger.error(f"[DB] Failed to insert candidate upload: {e}")
        raise

def get_candidate_data(candidate_name=None, limit=50, offset=0):
    """
    Retrieve candidate data from candidates table (consolidated data)

    Args:
        candidate_name (str): Filter by candidate name (optional)
        limit (int): Maximum number of records to return
        offset (int): Number of records to skip

    Returns:
        list: List of candidate records
    """
    if candidate_name:
        query = """
            SELECT * FROM candidates
            WHERE candidate_name ILIKE %s
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        params = (f"%{candidate_name}%", limit, offset)
    else:
        query = """
            SELECT * FROM candidates
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        params = (limit, offset)

    try:
        results = execute_query(query, params)
        logger.info(f"[DB] Retrieved {len(results)} candidate records from candidates table")
        return results
    except Exception as e:
        logger.error(f"[DB] Failed to retrieve candidate data: {e}")
        raise

def get_candidate_by_id(record_id):
    """
    Retrieve a specific candidate record by ID

    Args:
        record_id (int): Record ID

    Returns:
        dict: Candidate record or None
    """
    query = "SELECT * FROM candidate_uploads WHERE id = %s"

    try:
        results = execute_query(query, (record_id,))
        return results[0] if results else None
    except Exception as e:
        logger.error(f"[DB] Failed to retrieve candidate by ID {record_id}: {e}")
        raise

def update_candidate_json_data(record_id, json_data):
    """
    Update JSON data for a candidate record

    Args:
        record_id (int): Record ID
        json_data (dict): Updated JSON data

    Returns:
        bool: True if update successful
    """
    query = """
        UPDATE candidate_uploads
        SET json_data = %s, upload_time = CURRENT_TIMESTAMP
        WHERE id = %s
    """

    try:
        execute_query(query, (json.dumps(json_data), record_id), fetch=False)
        logger.info(f"[DB] Updated JSON data for record ID: {record_id}")
        return True
    except Exception as e:
        logger.error(f"[DB] Failed to update candidate JSON data: {e}")
        raise

def delete_candidate_record(record_id):
    """
    Delete a candidate record from database

    Args:
        record_id (int): Record ID to delete

    Returns:
        bool: True if deletion successful
    """
    query = "DELETE FROM candidate_uploads WHERE id = %s"

    try:
        execute_query(query, (record_id,), fetch=False)
        logger.info(f"[DB] Deleted candidate record ID: {record_id}")
        return True
    except Exception as e:
        logger.error(f"[DB] Failed to delete candidate record: {e}")
        raise

def get_candidate_files(candidate_name):
    """
    Get all files for a specific candidate

    Args:
        candidate_name (str): Candidate name

    Returns:
        list: List of file records
    """
    query = """
        SELECT id, file_name, file_type, file_path, upload_time
        FROM candidate_uploads
        WHERE candidate_name = %s
        ORDER BY upload_time DESC
    """

    try:
        results = execute_query(query, (candidate_name,))
        logger.info(f"[DB] Retrieved {len(results)} files for candidate: {candidate_name}")
        return results
    except Exception as e:
        logger.error(f"[DB] Failed to retrieve candidate files: {e}")
        raise

def search_candidates_by_json_field(field_name, search_value, limit=50):
    """
    Search candidates by JSON field value in candidates table

    Args:
        field_name (str): JSON field name (e.g., 'firstName', 'passport')
        search_value (str): Value to search for
        limit (int): Maximum results

    Returns:
        list: Matching candidate records
    """
    query = """
        SELECT * FROM candidates
        WHERE json_data->>%s ILIKE %s
        ORDER BY created_at DESC
        LIMIT %s
    """

    try:
        results = execute_query(query, (field_name, f"%{search_value}%", limit))
        logger.info(f"[DB] Found {len(results)} candidates matching {field_name}='{search_value}' in candidates table")
        return results
    except Exception as e:
        logger.error(f"[DB] Failed to search candidates by JSON field: {e}")
        raise

def get_upload_stats():
    """
    Get upload statistics from both candidates and candidate_uploads tables

    Returns:
        dict: Statistics about uploads and candidates
    """
    queries = {
        'total_candidates': "SELECT COUNT(*) as count FROM candidates",
        'total_uploads': "SELECT COUNT(*) as count FROM candidate_uploads",
        'unique_candidate_names': "SELECT COUNT(DISTINCT candidate_name) as count FROM candidate_uploads",
        'recent_candidates': "SELECT COUNT(*) as count FROM candidates WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'",
        'recent_uploads': "SELECT COUNT(*) as count FROM candidate_uploads WHERE upload_time >= CURRENT_TIMESTAMP - INTERVAL '24 hours'",
        'file_types': """
            SELECT file_type, COUNT(*) as count
            FROM candidate_uploads
            GROUP BY file_type
            ORDER BY count DESC
        """
    }

    stats = {}
    try:
        for key, query in queries.items():
            results = execute_query(query)
            if key == 'file_types':
                stats[key] = {row['file_type']: row['count'] for row in results}
            else:
                stats[key] = results[0]['count'] if results else 0

        logger.info("[DB] Retrieved upload and candidate statistics")
        return stats
    except Exception as e:
        logger.error(f"[DB] Failed to get upload stats: {e}")
        raise

def insert_or_update_candidate(candidate_name, candidate_folder, candidate_folder_path, json_data):
    """
    Insert or update a candidate record in the candidates table

    Args:
        candidate_name (str): Unique name of the candidate
        candidate_folder (str): Name of the candidate folder
        candidate_folder_path (str): Full path to the candidate folder
        json_data (dict): Consolidated candidate data

    Returns:
        int: ID of the inserted/updated record
    """
    query = """
        INSERT INTO candidates (candidate_name, candidate_folder, candidate_folder_path, json_data)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (candidate_name)
        DO UPDATE SET
            candidate_folder = EXCLUDED.candidate_folder,
            candidate_folder_path = EXCLUDED.candidate_folder_path,
            json_data = EXCLUDED.json_data
        RETURNING id
    """

    try:
        result = execute_query(query, (candidate_name, candidate_folder, candidate_folder_path, json.dumps(json_data)))
        if result:
            record_id = result[0]['id']
            logger.info(f"[DB] Inserted/updated candidate record ID: {record_id} for {candidate_name}")
            return record_id
        else:
            raise Exception("No ID returned from insert/update")
    except Exception as e:
        logger.error(f"[DB] Failed to insert/update candidate: {e}")
        raise

def save_candidate_with_files(candidate_name, candidate_folder, candidate_folder_path, json_data, moved_files, session_id=None, ocr_data=None):
    """
    Save candidate data to candidates table with reference to images in candidate_uploads table

    Args:
        candidate_name (str): Unique name of the candidate
        candidate_folder (str): Name of the candidate folder
        candidate_folder_path (str): Full path to the candidate folder
        json_data (dict): Candidate form data
        moved_files (list): List of moved file names (for reference only)
        session_id (str): Session ID linking to images in candidate_uploads
        ocr_data (dict): OCR extracted data

    Returns:
        dict: Result with success status and record ID
    """
    try:
        # Get image count from candidate_uploads for this session
        if session_id:
            image_count_query = "SELECT COUNT(*) as count FROM candidate_uploads WHERE session_id = %s"
            image_result = execute_query(image_count_query, (session_id,))
            files_count = image_result[0]['count'] if image_result else 0
        else:
            files_count = 0

        # Insert or update candidate record (images stored separately in candidate_uploads)
        query = """
            INSERT INTO candidates (
                candidate_name, candidate_folder, candidate_folder_path, json_data,
                session_id, ocr_data, last_updated
            ) VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (candidate_name)
            DO UPDATE SET
                candidate_folder = EXCLUDED.candidate_folder,
                candidate_folder_path = EXCLUDED.candidate_folder_path,
                json_data = EXCLUDED.json_data,
                session_id = EXCLUDED.session_id,
                ocr_data = EXCLUDED.ocr_data,
                last_updated = CURRENT_TIMESTAMP
            RETURNING id
        """

        result = execute_query(query, (
            candidate_name, candidate_folder, candidate_folder_path, json.dumps(json_data),
            session_id, json.dumps(ocr_data) if ocr_data else None
        ))

        if result:
            record_id = result[0]['id']
            logger.info(f"[DB] ✅ Successfully saved candidate record ID: {record_id} for {candidate_name} (images linked via session_id: {session_id})")
            return {
                "success": True,
                "record_id": record_id,
                "files_count": files_count,
                "session_id": session_id
            }
        else:
            raise Exception("No ID returned from insert/update")

    except Exception as e:
        logger.error(f"[DB] ❌ Failed to save candidate: {e}")
def insert_image_blob(candidate_id, file_type, file_data, mime_type, file_size, file_name=None, image_type=None, candidate_name=None):
    """
    Insert an image file into candidate_uploads table with file storage

    Args:
        candidate_id (int): Foreign key reference to candidates table
        file_type (str): File extension
        file_data (bytes): Binary file data
        mime_type (str): MIME type
        file_size (int): File size in bytes
        file_name (str, optional): Original filename
        image_type (str, optional): Type of image (photo, signature, etc.)
        candidate_name (str, optional): Candidate name for backward compatibility

    Returns:
        int: ID of the inserted record
    """
    import os
    from config import Config

    # Mapping from image_type to fixed filename
    image_type_to_filename = {
        'photo': 'photo.png',
        'signature': 'signature.png',
        'passport_front': 'passport_front.jpg',
        'passport_back': 'passport_back.jpg',
        'cdc': 'cdc.jpg',
        'coc': 'coc.jpg',
        'payment': 'payment.jpg',
        'marksheet': 'marksheet.pdf'
    }

    # Determine fixed filename based on image_type
    fixed_filename = image_type_to_filename.get(image_type, f"{image_type or 'unknown'}.{file_type}")

    # Create candidate folder path
    candidate_folder = f"CANDIDATE_{candidate_id}"
    candidate_dir = os.path.join(Config.BASE_STORAGE_PATH, candidate_folder)

    # Ensure candidate directory exists
    try:
        os.makedirs(candidate_dir, exist_ok=True)
    except Exception as e:
        logger.error(f"[FILE] ❌ Failed to create candidate directory {candidate_dir}: {e}")
        raise

    # Full file path
    file_path = os.path.join(candidate_dir, fixed_filename)

    # Save file to disk
    try:
        with open(file_path, 'wb') as f:
            f.write(file_data)
        logger.info(f"[FILE] ✅ Saved image to {file_path}")
    except Exception as e:
        logger.error(f"[FILE] ❌ Failed to save image to {file_path}: {e}")
        raise

    # Relative path for database storage
    relative_path = f"{candidate_folder}/{fixed_filename}"

    query = """
        INSERT INTO candidate_uploads (
            candidate_id, candidate_name, file_name, file_type, file_path,
            mime_type, file_size, image_type, upload_time
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        RETURNING id
    """

    try:
        result = execute_query(query, (
            candidate_id, candidate_name, file_name, file_type, relative_path,
            mime_type, file_size, image_type
        ))
        if result:
            record_id = result[0]['id']
            logger.info(f"[DB] ✅ Inserted image file record ID: {record_id} for candidate {candidate_id} ({file_size} bytes) -> {relative_path}")
            return record_id
        else:
            raise Exception("No ID returned from insert")
    except Exception as e:
        logger.error(f"[DB] ❌ Failed to insert image file record: {e}")
        # Clean up file if DB insert fails
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"[FILE] 🧹 Cleaned up file {file_path} after DB failure")
        except Exception as cleanup_e:
            logger.error(f"[FILE] ❌ Failed to clean up {file_path}: {cleanup_e}")
        raise

def get_candidate_images(candidate_id):
    """
    Retrieve all images for a specific candidate

    Args:
        candidate_id (int): Candidate ID to fetch images for

    Returns:
        list: List of image records with file_type, file_path, mime_type
    """
    query = """
        SELECT file_type, file_path, mime_type, file_name, image_type, upload_time
        FROM candidate_uploads
        WHERE candidate_id = %s AND file_path IS NOT NULL AND file_path != ''
        ORDER BY upload_time DESC
    """

    try:
        results = execute_query(query, (candidate_id,))
        logger.info(f"[DB] Retrieved {len(results)} images for candidate {candidate_id}")
        return results
    except Exception as e:
        logger.error(f"[DB] Failed to retrieve candidate images for candidate {candidate_id}: {e}")
        raise
        raise
def insert_receipt_invoice_data(receipt_data):
    """
    Insert a new ReceiptInvoiceData record

    Args:
        receipt_data (dict): Receipt invoice data to insert

    Returns:
        int: ID of the inserted record
    """
    # First, ensure table exists
    create_table_query = """
        CREATE TABLE IF NOT EXISTS ReceiptInvoiceData (
            invoice_no VARCHAR(100) PRIMARY KEY,
            candidate_id INTEGER,
            company_name VARCHAR(255),
            company_account_number VARCHAR(100),
            customer_name VARCHAR(255),
            customer_phone VARCHAR(20),
            party_name VARCHAR(255),
            invoice_date DATE,
            amount DECIMAL(10,2),
            gst DECIMAL(10,2) DEFAULT 0,
            gst_applied DECIMAL(10,2) DEFAULT 0,
            cgst DECIMAL(10,2) DEFAULT 0,
            sgst DECIMAL(10,2) DEFAULT 0,
            final_amount DECIMAL(10,2),
            delivery_note VARCHAR(100),
            dispatch_doc_no VARCHAR(100),
            delivery_date DATE,
            dispatch_through VARCHAR(100),
            destination TEXT,
            terms_of_delivery TEXT,
            selected_courses JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """

    # Add gst_applied column if it doesn't exist (keep as DECIMAL for compatibility)
    # Also alter columns to ensure they can handle longer values
    add_column_query = """
        ALTER TABLE ReceiptInvoiceData
        ADD COLUMN IF NOT EXISTS gst_applied DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS cgst DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS sgst DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE ReceiptInvoiceData
        ALTER COLUMN invoice_no TYPE VARCHAR(500),
        ALTER COLUMN company_name TYPE VARCHAR(500),
        ALTER COLUMN company_account_number TYPE VARCHAR(500),
        ALTER COLUMN customer_name TYPE VARCHAR(500),
        ALTER COLUMN party_name TYPE VARCHAR(500),
        ALTER COLUMN delivery_note TYPE VARCHAR(500),
        ALTER COLUMN dispatch_doc_no TYPE VARCHAR(500),
        ALTER COLUMN dispatch_through TYPE VARCHAR(500);
    """

    try:
        # Create table if it doesn't exist
        execute_query(create_table_query, fetch=False)
        logger.info("[DB] ✅ Ensured ReceiptInvoiceData table exists")

        # Add gst_applied column if missing
        execute_query(add_column_query, fetch=False)
        logger.info("[DB] ✅ Ensured gst_applied column exists")

        # Now insert the data
        query = """
            INSERT INTO ReceiptInvoiceData (
                invoice_no, candidate_id, company_name, company_account_number,
                customer_name, customer_phone, party_name, invoice_date,
                amount, gst, gst_applied, cgst, sgst, final_amount,
                delivery_note, dispatch_doc_no, delivery_date, dispatch_through,
                destination, terms_of_delivery, selected_courses, certificate_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING invoice_no
        """

        # Convert boolean gst_applied to numeric for database compatibility
        gst_applied_value = 1 if receipt_data.get('gst_applied', False) else 0
    
        # Handle selectedCourses - convert array of objects to JSON string for database storage
        selected_courses_json = None
        if receipt_data.get('selectedCourses'):
            if isinstance(receipt_data['selectedCourses'], list):
                # Store as JSON array of objects
                selected_courses_json = json.dumps(receipt_data['selectedCourses'])
            elif isinstance(receipt_data['selectedCourses'], str):
                # If already a string, try to parse as JSON or store as-is
                try:
                    # Try to parse as JSON first
                    json.loads(receipt_data['selectedCourses'])
                    selected_courses_json = receipt_data['selectedCourses']
                except (json.JSONDecodeError, TypeError):
                    # If not valid JSON, wrap in array
                    selected_courses_json = json.dumps([receipt_data['selectedCourses']])
        else:
            selected_courses_json = json.dumps([])  # Empty array for no courses
    
        logger.info(f"[DB] Processing selectedCourses: {receipt_data.get('selectedCourses')} -> JSON stored")

        # Auto-populate certificate_id if not provided but selectedCourses exist
        certificate_id = receipt_data.get('certificate_id')
        if certificate_id is None and receipt_data.get('candidate_id') and receipt_data.get('selectedCourses'):
            try:
                # Use the original selectedCourses from receipt_data
                courses = receipt_data['selectedCourses']

                if isinstance(courses, list) and len(courses) > 0:
                    # Get the first certificate name
                    first_course = courses[0]
                    if isinstance(first_course, dict) and 'certificate_name' in first_course:
                        certificate_name = first_course['certificate_name']
                    elif isinstance(first_course, str):
                        certificate_name = first_course
                    else:
                        certificate_name = str(first_course)

                    # Look up certificate_id
                    cert_query = """
                        SELECT id FROM certificate_selections
                        WHERE candidate_id = %s AND certificate_name = %s
                        LIMIT 1
                    """
                    cert_result = execute_query(cert_query, (receipt_data['candidate_id'], certificate_name), fetch=True)
                    if cert_result:
                        certificate_id = cert_result[0]['id']
                        logger.info(f"[DB] Auto-populated certificate_id: {certificate_id} for certificate: {certificate_name}")
            except Exception as e:
                logger.warning(f"[DB] Failed to auto-populate certificate_id: {e}")

        result = execute_query(query, (
            receipt_data['invoice_no'],
            receipt_data.get('candidate_id'),
            receipt_data.get('company_name'),
            receipt_data.get('company_account_number'),
            receipt_data.get('customer_name'),
            receipt_data.get('customer_phone'),
            receipt_data.get('party_name'),
            receipt_data.get('invoice_date'),
            receipt_data.get('amount', 0),
            receipt_data.get('gst', 0),
            gst_applied_value,  # Convert boolean to numeric (1/0)
            receipt_data.get('cgst', 0),
            receipt_data.get('sgst', 0),
            receipt_data.get('final_amount', 0),
            receipt_data.get('delivery_note'),
            receipt_data.get('dispatch_doc_no'),
            receipt_data.get('delivery_date'),
            receipt_data.get('dispatch_through'),
            receipt_data.get('destination'),
            receipt_data.get('terms_of_delivery'),
            selected_courses_json,  # JSON data for selected courses
            certificate_id  # Auto-populated or provided certificate_id
        ))

        if result:
            invoice_no = result[0]['invoice_no']
            logger.info(f"[DB] ✅ Inserted ReceiptInvoiceData record for invoice: {invoice_no}")
            return invoice_no
        else:
            raise Exception("No invoice_no returned from insert")
    except Exception as e:
        logger.error(f"[DB] ❌ Failed to insert ReceiptInvoiceData: {e}")
        raise

def get_receipt_invoice_data(invoice_no=None, candidate_id=None, limit=50, offset=0):
    """
    Retrieve ReceiptInvoiceData records

    Args:
        invoice_no (str): Filter by invoice number
        candidate_id (int): Filter by candidate ID
        limit (int): Maximum number of records to return
        offset (int): Number of records to skip

    Returns:
        list: List of receipt invoice records
    """
    if invoice_no:
        query = """
            SELECT * FROM ReceiptInvoiceData
            WHERE invoice_no = %s
            ORDER BY created_at DESC
        """
        params = (invoice_no,)
    elif candidate_id:
        query = """
            SELECT rid.*, cs.candidate_name, cs.client_name
            FROM ReceiptInvoiceData rid
            LEFT JOIN certificate_selections cs ON rid.candidate_id = cs.candidate_id
            WHERE rid.candidate_id = %s
            ORDER BY rid.created_at DESC
            LIMIT %s OFFSET %s
        """
        params = (candidate_id, limit, offset)
    else:
        query = """
            SELECT * FROM ReceiptInvoiceData
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        params = (limit, offset)

    try:
        results = execute_query(query, params)
        logger.info(f"[DB] Retrieved {len(results)} ReceiptInvoiceData records")
        return results
    except Exception as e:
        logger.error(f"[DB] Failed to retrieve ReceiptInvoiceData: {e}")
        raise

def update_receipt_invoice_data(invoice_no, update_data):
    """
    Update a ReceiptInvoiceData record

    Args:
        invoice_no (str): Invoice number to update
        update_data (dict): Fields to update

    Returns:
        bool: True if update successful
    """
    # Build dynamic update query
    set_parts = []
    params = []

    for field, value in update_data.items():
        set_parts.append(f"{field} = %s")
        params.append(value)

    set_clause = ", ".join(set_parts)
    query = f"""
        UPDATE ReceiptInvoiceData
        SET {set_clause}, updated_at = CURRENT_TIMESTAMP
        WHERE invoice_no = %s
    """
    params.append(invoice_no)

    try:
        execute_query(query, params, fetch=False)
        logger.info(f"[DB] ✅ Updated ReceiptInvoiceData for invoice: {invoice_no}")
        return True
    except Exception as e:
        logger.error(f"[DB] ❌ Failed to update ReceiptInvoiceData: {e}")
        raise

def delete_receipt_invoice_data(invoice_no):
    """
    Delete a ReceiptInvoiceData record

    Args:
        invoice_no (str): Invoice number to delete

    Returns:
        bool: True if deletion successful
    """
    query = "DELETE FROM ReceiptInvoiceData WHERE invoice_no = %s"

    try:
        execute_query(query, (invoice_no,), fetch=False)
        logger.info(f"[DB] ✅ Deleted ReceiptInvoiceData for invoice: {invoice_no}")
        return True
    except Exception as e:
        logger.error(f"[DB] ❌ Failed to delete ReceiptInvoiceData: {e}")
        raise
        raise

# Initialize connection pool on module import
try:
    DatabaseConnection.get_pool()
except Exception as e:
    logger.warning(f"[DB] Could not initialize connection pool: {e}")
    logger.warning("[DB] Database operations will fail until connection is established")