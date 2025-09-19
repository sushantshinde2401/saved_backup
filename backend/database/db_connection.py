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

def save_candidate_with_files(candidate_name, candidate_folder, candidate_folder_path, json_data, moved_files):
    """
    Save candidate data to both candidates and candidate_uploads tables

    Args:
        candidate_name (str): Unique name of the candidate
        candidate_folder (str): Name of the candidate folder
        candidate_folder_path (str): Full path to the candidate folder
        json_data (dict): Candidate form data
        moved_files (list): List of moved file names

    Returns:
        dict: Result with success status and record IDs
    """
    candidate_id = None
    upload_ids = []

    try:
        # First, insert/update the candidate record
        candidate_id = insert_or_update_candidate(
            candidate_name=candidate_name,
            candidate_folder=candidate_folder,
            candidate_folder_path=candidate_folder_path,
            json_data=json_data
        )
        logger.info(f"[DB] ✅ Candidate record saved with ID: {candidate_id}")

        # Then, insert records for each moved file
        for file_info in moved_files:
            file_path = os.path.join(candidate_folder_path, file_info)
            file_name = file_info
            file_type = os.path.splitext(file_info)[1].lstrip('.')  # Get extension without dot

            upload_id = insert_candidate_upload(
                candidate_name=candidate_name,
                file_name=file_name,
                file_type=file_type,
                file_path=file_path,
                json_data=json_data
            )
            upload_ids.append(upload_id)
            logger.info(f"[DB] ✅ File record saved with ID: {upload_id} for {file_name}")

        logger.info(f"[DB] ✅ Successfully saved candidate and {len(upload_ids)} file records")
        return {
            "success": True,
            "candidate_id": candidate_id,
            "upload_ids": upload_ids,
            "files_count": len(upload_ids)
        }

    except Exception as e:
        logger.error(f"[DB] ❌ Failed to save candidate with files: {e}")
        # Note: In a production system, you might want to implement rollback logic here
        # For now, we'll let the calling code handle partial failures
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
            invoice_no VARCHAR(50) PRIMARY KEY,
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
            selected_courses JSONB,
            delivery_note VARCHAR(100),
            dispatch_doc_no VARCHAR(100),
            delivery_date DATE,
            dispatch_through VARCHAR(100),
            destination TEXT,
            terms_of_delivery TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """

    # Add gst_applied column if it doesn't exist (keep as DECIMAL for compatibility)
    add_column_query = """
        ALTER TABLE ReceiptInvoiceData
        ADD COLUMN IF NOT EXISTS gst_applied DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS cgst DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS sgst DECIMAL(10,2) DEFAULT 0
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
                amount, gst, gst_applied, cgst, sgst, final_amount, selected_courses,
                delivery_note, dispatch_doc_no, delivery_date, dispatch_through,
                destination, terms_of_delivery
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING invoice_no
        """

        # Convert boolean gst_applied to numeric for database compatibility
        gst_applied_value = 1 if receipt_data.get('gst_applied', False) else 0

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
            json.dumps(receipt_data.get('selected_courses', [])),
            receipt_data.get('delivery_note'),
            receipt_data.get('dispatch_doc_no'),
            receipt_data.get('delivery_date'),
            receipt_data.get('dispatch_through'),
            receipt_data.get('destination'),
            receipt_data.get('terms_of_delivery')
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
            SELECT * FROM ReceiptInvoiceData
            WHERE candidate_id = %s
            ORDER BY created_at DESC
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
        # Parse JSON fields
        for result in results:
            if result.get('selected_courses'):
                result['selected_courses'] = json.loads(result['selected_courses'])

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
        if field == 'selected_courses':
            set_parts.append(f"{field} = %s")
            params.append(json.dumps(value))
        else:
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