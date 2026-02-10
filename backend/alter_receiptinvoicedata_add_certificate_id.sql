-- Alter ReceiptInvoiceData table to add certificate_id foreign key
-- This script adds certificate_id column (if not exists) and sets up foreign key relationship with ON DELETE CASCADE

-- Add certificate_id column if it doesn't exist
ALTER TABLE ReceiptInvoiceData ADD COLUMN IF NOT EXISTS certificate_id INTEGER;

-- Drop existing constraint if it exists (to avoid conflicts)
ALTER TABLE ReceiptInvoiceData DROP CONSTRAINT IF EXISTS fk_receiptinvoicedata_certificate_id;

-- Add foreign key constraint with ON DELETE CASCADE
ALTER TABLE ReceiptInvoiceData ADD CONSTRAINT fk_receiptinvoicedata_certificate_id
FOREIGN KEY (certificate_id) REFERENCES certificate_selections(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_receiptinvoicedata_certificate_id ON ReceiptInvoiceData(certificate_id);

-- Add comment
COMMENT ON COLUMN ReceiptInvoiceData.certificate_id IS 'Foreign key to certificate_selections(id) for cascade deletion';

-- Note: candidate_id remains for reporting purposes but is not used for deletion logic