"""
Script to populate Master_Database_Table_A with consolidated data from certificate_selections, candidates, and receiptinvoicedata tables.

This script creates the Master_Database_Table_A table and populates it with data from the existing tables,
deriving client_id and certificate_id as shortnames from client_name and certificate_name respectively.

Usage:
    python populate_master_database_table.py

Requirements:
    - PostgreSQL database connection configured in config.py
    - Existing tables: certificate_selections, candidates, receiptinvoicedata
"""

import logging
from database.db_connection import execute_query

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_master_table():
    """Create the Master_Database_Table_A table if it doesn't exist."""
    create_table_query = """
    CREATE TABLE IF NOT EXISTS Master_Database_Table_A (
        creation_date DATE,
        client_name VARCHAR(255),
        client_id VARCHAR(50),
        candidate_id INT PRIMARY KEY,
        candidate_name VARCHAR(255),
        nationality VARCHAR(100),
        passport VARCHAR(50),
        cdcNo VARCHAR(50),
        indosNo VARCHAR(50),
        certificate_name TEXT,
        certificate_id TEXT,
        companyName VARCHAR(255),
        person_in_charge VARCHAR(255),
        delivery_note VARCHAR(100),
        delivery_date DATE,
        terms_of_delivery VARCHAR(100),
        invoice_no VARCHAR(100)
    );
    """

    try:
        execute_query(create_table_query, fetch=False)
        logger.info("✅ Master_Database_Table_A table created or already exists")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to create Master_Database_Table_A table: {e}")
        return False

def populate_master_table():
    """Populate Master_Database_Table_A with data from existing tables."""
    populate_query = """
    INSERT INTO Master_Database_Table_A (
        creation_date,
        client_name,
        client_id,
        candidate_id,
        candidate_name,
        nationality,
        passport,
        cdcNo,
        indosNo,
        certificate_name,
        certificate_id,
        companyName,
        person_in_charge,
        delivery_note,
        delivery_date,
        terms_of_delivery,
        invoice_no
    )
    SELECT
        MIN(cs.creation_date)::DATE,
        cs.client_name,
        UPPER(LEFT(COALESCE(cs.client_name, 'UNK'), 3)) AS client_id,
        cs.candidate_id,
        cs.candidate_name,
        COALESCE(c.json_data->>'nationality', 'Unknown') AS nationality,
        COALESCE(c.json_data->>'passport', 'N/A') AS passport,
        COALESCE(c.json_data->>'cdcNo', 'N/A') AS cdcNo,
        COALESCE(c.json_data->>'indosNo', 'N/A') AS indosNo,
        COALESCE(
            string_agg(DISTINCT cs.certificate_name, ', ' ORDER BY cs.certificate_name),
            'N/A'
        ) AS certificate_name,
        COALESCE(
            string_agg(DISTINCT UPPER(LEFT(cs.certificate_name, 3)), ', ' ORDER BY UPPER(LEFT(cs.certificate_name, 3))),
            'N/A'
        ) AS certificate_id,
        COALESCE(c.json_data->>'companyName', 'N/A') AS companyName,
        COALESCE(c.json_data->>'personInCharge', 'N/A') AS person_in_charge,
        COALESCE(rid.delivery_note, 'N/A') AS delivery_note,
        COALESCE(rid.delivery_date, MIN(cs.creation_date)) AS delivery_date,
        COALESCE(rid.terms_of_delivery, 'N/A') AS terms_of_delivery,
        COALESCE(rid.invoice_no, 'N/A') AS invoice_no
    FROM certificate_selections cs
    JOIN candidates c ON cs.candidate_id = c.id
    LEFT JOIN receiptinvoicedata rid ON cs.candidate_id = rid.candidate_id
    WHERE cs.candidate_id IS NOT NULL
      AND c.id IS NOT NULL
    GROUP BY cs.candidate_id, cs.candidate_name, cs.client_name, c.json_data,
             rid.delivery_note, rid.delivery_date, rid.terms_of_delivery, rid.invoice_no
    ;
    """

    try:
        # Execute the population query
        execute_query(populate_query, fetch=False)
        logger.info("✅ Master_Database_Table_A populated successfully")

        # Get count of inserted records
        count_query = "SELECT COUNT(*) as count FROM Master_Database_Table_A;"
        result = execute_query(count_query)
        if result:
            count = result[0]['count']
            logger.info(f"📊 Total records in Master_Database_Table_A: {count}")

        return True
    except Exception as e:
        logger.error(f"❌ Failed to populate Master_Database_Table_A: {e}")
        return False

def verify_population():
    """Verify the population by checking a few sample records."""
    verify_query = """
    SELECT candidate_id, candidate_name, client_name, client_id, certificate_name, certificate_id, invoice_no
    FROM Master_Database_Table_A
    LIMIT 5;
    """

    try:
        results = execute_query(verify_query)
        if results:
            logger.info("🔍 Sample records from Master_Database_Table_A (one per candidate):")
            for row in results:
                logger.info(f"  - Candidate: {row['candidate_name']} (ID: {row['candidate_id']}), Client: {row['client_name']} ({row['client_id']}), Certificates: {row['certificate_name']} ({row['certificate_id']}), Invoice: {row['invoice_no']}")
        else:
            logger.warning("⚠️ No records found in Master_Database_Table_A after population")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to verify population: {e}")
        return False

def main():
    """Main function to execute the population process."""
    logger.info("🚀 Starting Master_Database_Table_A population process")

    # Step 1: Create the table
    if not create_master_table():
        logger.error("❌ Table creation failed. Aborting population.")
        return False

    # Step 2: Populate the table
    if not populate_master_table():
        logger.error("❌ Table population failed.")
        return False

    # Step 3: Verify the population
    if not verify_population():
        logger.warning("⚠️ Population verification failed, but process may have succeeded.")

    logger.info("✅ Master_Database_Table_A population process completed")
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)