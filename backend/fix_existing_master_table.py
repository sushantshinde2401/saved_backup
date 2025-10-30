#!/usr/bin/env python3
"""
One-time script to update existing Master_Database_Table_A records
with missing certificate_name, certificate_id, delivery_note, terms_of_delivery, and invoice_no values.

This script should be run once after applying the corrected post_data_insert.py hook.
"""

import logging
from database.db_connection import execute_query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_existing_master_table_records():
    """
    Update existing master table records that have 'N/A' or NULL values
    for certificate_name, certificate_id, delivery_note, terms_of_delivery, and invoice_no.
    """
    try:
        logger.info("🔄 Starting one-time update of existing Master_Database_Table_A records...")

        update_query = """
        UPDATE Master_Database_Table_A
        SET
            certificate_name = COALESCE(sub.certificate_name, 'N/A'),
            certificate_id = COALESCE(sub.certificate_id, 'N/A'),
            delivery_note = COALESCE(sub.delivery_note, 'N/A'),
            terms_of_delivery = COALESCE(sub.terms_of_delivery, 'N/A'),
            invoice_no = COALESCE(sub.invoice_no, 'N/A')
        FROM (
            SELECT
                m.candidate_id,
                string_agg(DISTINCT cs.certificate_name, ',') AS certificate_name,
                string_agg(DISTINCT UPPER(LEFT(cs.certificate_name, 3)), ',') AS certificate_id,
                rid.delivery_note,
                rid.terms_of_delivery,
                rid.invoice_no
            FROM Master_Database_Table_A m
            LEFT JOIN certificate_selections cs ON m.candidate_id = cs.candidate_id
            LEFT JOIN receiptinvoicedata rid ON m.candidate_id = rid.candidate_id
            WHERE (m.certificate_name = 'N/A' OR m.certificate_name IS NULL)
               OR (m.delivery_note = 'N/A' OR m.delivery_note IS NULL)
               OR (m.terms_of_delivery = 'N/A' OR m.terms_of_delivery IS NULL)
               OR (m.invoice_no = 'N/A' OR m.invoice_no IS NULL)
            GROUP BY m.candidate_id, rid.delivery_note, rid.terms_of_delivery, rid.invoice_no
        ) sub
        WHERE Master_Database_Table_A.candidate_id = sub.candidate_id;
        """

        # Execute the update query
        result = execute_query(update_query, fetch=False)
        logger.info("✅ Successfully updated existing Master_Database_Table_A records")

        # Get count of affected rows (if needed)
        count_query = """
        SELECT COUNT(*) as updated_count
        FROM Master_Database_Table_A
        WHERE certificate_name != 'N/A' AND certificate_name IS NOT NULL
           AND delivery_note != 'N/A' AND delivery_note IS NOT NULL;
        """

        count_result = execute_query(count_query, fetch=True)
        if count_result:
            logger.info(f"📊 Total records with populated data: {count_result[0]['updated_count']}")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to update existing master table records: {e}")
        return False

if __name__ == "__main__":
    print("Starting one-time fix for existing Master_Database_Table_A records...")
    success = fix_existing_master_table_records()
    if success:
        print("✅ Fix completed successfully!")
    else:
        print("❌ Fix failed. Check logs for details.")