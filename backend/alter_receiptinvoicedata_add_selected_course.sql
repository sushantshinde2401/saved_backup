-- Script to drop selected_course column from ReceiptInvoiceData table

ALTER TABLE ReceiptInvoiceData
DROP COLUMN IF EXISTS selected_course;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'selected_course column dropped from ReceiptInvoiceData table successfully';
END $$;