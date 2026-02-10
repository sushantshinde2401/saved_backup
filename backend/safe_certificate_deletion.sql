-- Safe Certificate Deletion Logic
-- This script provides examples of how to safely delete certificates with cascade deletion

-- Function to safely delete a certificate by id
CREATE OR REPLACE FUNCTION delete_certificate_safe(cert_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    cert_exists BOOLEAN;
    related_count INTEGER;
BEGIN
    -- Check if certificate exists
    SELECT EXISTS(SELECT 1 FROM certificate_selections WHERE id = cert_id) INTO cert_exists;

    IF NOT cert_exists THEN
        RETURN 'Certificate with id ' || cert_id || ' does not exist.';
    END IF;

    -- Optional: Count related records for logging
    SELECT COUNT(*) INTO related_count
    FROM (
        SELECT certificate_id FROM receiptinvoicedata WHERE certificate_id = cert_id
        UNION ALL
        SELECT certificate_id FROM invoice_images WHERE certificate_id = cert_id
        UNION ALL
        SELECT certificate_id FROM clientledger WHERE certificate_id = cert_id
        UNION ALL
        SELECT certificate_id FROM master_database_table_a WHERE certificate_id = cert_id
    ) AS related;

    -- Perform the deletion (cascade will handle related records)
    DELETE FROM certificate_selections WHERE id = cert_id;

    -- Return success message
    RETURN 'Certificate deleted successfully. ' || related_count || ' related records were also deleted.';

EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error deleting certificate: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT delete_certificate_safe(123);

-- Direct deletion (simpler, relies on CASCADE):
-- DELETE FROM certificate_selections WHERE id = 123;

-- Note: ON DELETE CASCADE ensures all related records are automatically removed
-- No manual deletion of child records is needed