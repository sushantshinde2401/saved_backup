-- Alter Master_Database_Table_A to allow multiple billings per certificate
-- Change unique constraint to include invoice_no

ALTER TABLE master_database_table_a DROP CONSTRAINT IF EXISTS master_database_table_a_candidate_id_certificate_name_key;
ALTER TABLE master_database_table_a ADD CONSTRAINT master_database_table_a_candidate_id_certificate_name_invoice_no_key UNIQUE (candidate_id, certificate_name, invoice_no);