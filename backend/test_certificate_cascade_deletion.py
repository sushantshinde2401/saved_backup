#!/usr/bin/env python3
"""
Test script for certificate cascade deletion functionality.

This script tests the foreign key relationships and ON DELETE CASCADE behavior.
Run this after applying all ALTER scripts.
"""

import logging
from database.db_connection import execute_query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_certificate_cascade_deletion():
    """Test the cascade deletion functionality."""

    try:
        # Insert test data
        logger.info("Inserting test candidate and certificate...")

        # Insert into candidates first
        import time
        unique_name = f'Test Candidate {int(time.time())}'
        insert_candidate = f"""
        INSERT INTO candidates (candidate_name, json_data)
        VALUES ('{unique_name}', '{{"test": true}}')
        RETURNING id, candidate_name;
        """
        try:
            candidate_result = execute_query(insert_candidate, fetch=True)
            if not candidate_result:
                logger.error("Failed to insert candidate - no result")
                return False
            candidate_id = candidate_result[0][0]
            candidate_name = candidate_result[0][1]
            logger.info(f"Inserted candidate with id: {candidate_id}, name: {candidate_name}")
        except Exception as e:
            logger.error(f"Failed to insert candidate: {e}")
            return False

        # Insert into certificate_selections
        insert_cert = f"""
        INSERT INTO certificate_selections (candidate_id, candidate_name, certificate_name)
        VALUES ({candidate_id}, '{candidate_name}', 'Test Certificate')
        RETURNING id;
        """
        cert_result = execute_query(insert_cert, fetch=True)
        if not cert_result:
            logger.error("Failed to insert certificate")
            return False
        cert_id = cert_result[0][0]
        logger.info(f"Inserted certificate with id: {cert_id}")

        # Insert related records
        insert_receipt = f"""
        INSERT INTO receiptinvoicedata (candidate_id, invoice_no, company_name, certificate_id)
        VALUES (1, 'TEST-001', 'Test Company', {cert_id});
        """
        execute_query(insert_receipt)

        insert_image = f"""
        INSERT INTO invoice_images (invoice_no, image_data, certificate_id)
        VALUES ('TEST-001', '\\x', {cert_id});
        """
        execute_query(insert_image)

        insert_ledger = f"""
        INSERT INTO clientledger (company_name, date, voucher_no, debit, certificate_id)
        VALUES ('Test Company', CURRENT_DATE, 'TEST-001', 1000.00, {cert_id});
        """
        execute_query(insert_ledger)

        insert_master = f"""
        INSERT INTO master_database_table_a (candidate_id, certificate_id)
        VALUES (1, {cert_id});
        """
        execute_query(insert_master)

        logger.info("Inserted related records. Now testing deletion...")

        # Count records before deletion
        count_query = f"""
        SELECT
            (SELECT COUNT(*) FROM receiptinvoicedata WHERE certificate_id = {cert_id}) as receipt_count,
            (SELECT COUNT(*) FROM invoice_images WHERE certificate_id = {cert_id}) as image_count,
            (SELECT COUNT(*) FROM clientledger WHERE certificate_id = {cert_id}) as ledger_count,
            (SELECT COUNT(*) FROM master_database_table_a WHERE certificate_id = {cert_id}) as master_count;
        """
        before_counts = execute_query(count_query, fetch=True)[0]
        logger.info(f"Before deletion counts: {before_counts}")

        # Delete certificate
        delete_query = f"DELETE FROM certificate_selections WHERE id = {cert_id};"
        execute_query(delete_query)
        logger.info("Certificate deleted. Checking cascade...")

        # Count records after deletion
        after_counts = execute_query(count_query, fetch=True)[0]
        logger.info(f"After deletion counts: {after_counts}")

        # Verify all related records are deleted
        if all(count == 0 for count in after_counts):
            logger.info("✅ SUCCESS: All related records were deleted via CASCADE")
            return True
        else:
            logger.error("❌ FAILURE: Some related records remain after deletion")
            return False

    except Exception as e:
        logger.error(f"Test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = test_certificate_cascade_deletion()
    if success:
        print("All tests passed!")
    else:
        print("Tests failed!")