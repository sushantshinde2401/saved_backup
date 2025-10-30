"""
Script to create the invoice_images table for storing invoice PDFs.

This script creates the invoice_images table that stores generated invoice PDFs
as binary data, linked to invoices by invoice_no.

Usage:
    python create_invoice_images_table.py

Requirements:
    - PostgreSQL database connection configured in config.py
    - Database connection working
"""

import logging
from database.db_connection import execute_query

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_invoice_images_table():
    """Create the invoice_images table if it doesn't exist."""

    # First, drop the table if it exists to ensure clean recreation
    drop_table_query = "DROP TABLE IF EXISTS invoice_images;"

    # Create table query
    create_table_query = """
    CREATE TABLE invoice_images (
        id SERIAL PRIMARY KEY,
        invoice_no VARCHAR(500) NOT NULL,
        image_data BYTEA NOT NULL,
        image_type VARCHAR(10) DEFAULT 'pdf',
        file_name VARCHAR(255),
        file_size INTEGER,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(invoice_no)
    );
    """

    # Create index for better performance
    create_index_query = """
    CREATE INDEX IF NOT EXISTS idx_invoice_images_invoice_no
    ON invoice_images(invoice_no);
    """

    try:
        # Drop existing table if any
        logger.info("🗑️ Dropping existing invoice_images table (if exists)...")
        execute_query(drop_table_query, fetch=False)
        logger.info("✅ Existing table dropped successfully")

        # Create new table
        logger.info("📋 Creating invoice_images table...")
        execute_query(create_table_query, fetch=False)
        logger.info("✅ invoice_images table created successfully")

        # Create index
        logger.info("🔍 Creating index on invoice_no...")
        execute_query(create_index_query, fetch=False)
        logger.info("✅ Index created successfully")

        # Verify table creation
        verify_query = """
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'invoice_images'
        ORDER BY ordinal_position;
        """

        columns = execute_query(verify_query)
        if columns:
            logger.info("📋 Table structure verification:")
            for col in columns:
                nullable = "NOT NULL" if col['is_nullable'] == 'NO' else "NULL"
                logger.info(f"  - {col['column_name']}: {col['data_type']} {nullable}")

        # Test insert to ensure table works
        logger.info("🧪 Testing table functionality...")
        test_insert = execute_query("""
            INSERT INTO invoice_images (invoice_no, image_data, file_name, file_size)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, ('TEST-INVOICE-001', b'test_pdf_data', 'test_invoice.pdf', 12345))

        if test_insert:
            test_id = test_insert[0]['id']
            logger.info(f"✅ Test insert successful (ID: {test_id})")

            # Clean up test record
            execute_query("DELETE FROM invoice_images WHERE id = %s", (test_id,), fetch=False)
            logger.info("🧹 Test record cleaned up")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to create invoice_images table: {e}")
        return False

def verify_table_exists():
    """Verify that the invoice_images table exists and is accessible."""
    try:
        result = execute_query("""
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_name = 'invoice_images' AND table_schema = 'public'
        """)

        if result and result[0]['count'] > 0:
            logger.info("✅ invoice_images table verified to exist")

            # Get record count
            count_result = execute_query("SELECT COUNT(*) as count FROM invoice_images")
            record_count = count_result[0]['count'] if count_result else 0
            logger.info(f"📊 Current records in table: {record_count}")

            return True
        else:
            logger.error("❌ invoice_images table not found after creation")
            return False

    except Exception as e:
        logger.error(f"❌ Error verifying table: {e}")
        return False

def main():
    """Main function to execute the table creation process."""
    logger.info("🚀 Starting invoice_images table creation process")

    # Create the table
    if not create_invoice_images_table():
        logger.error("❌ Table creation failed")
        return False

    # Verify the table
    if not verify_table_exists():
        logger.error("❌ Table verification failed")
        return False

    logger.info("✅ invoice_images table creation process completed successfully!")
    logger.info("")
    logger.info("📋 Table Summary:")
    logger.info("  - Stores invoice PDFs as binary data")
    logger.info("  - Linked to invoices by invoice_no")
    logger.info("  - Accessible from Master_Database_Table_A via JOIN")
    logger.info("  - Auto-generates PDFs when invoices are finalized")
    logger.info("")
    logger.info("🔗 Usage in queries:")
    logger.info("  SELECT mdta.*, ii.image_data, ii.file_name")
    logger.info("  FROM Master_Database_Table_A mdta")
    logger.info("  LEFT JOIN invoice_images ii ON mdta.invoice_no = ii.invoice_no")

    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)