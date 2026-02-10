-- Alter ClientLedger table to add certificate_id foreign key
-- This script adds certificate_id column (if not exists) and sets up foreign key relationship with ON DELETE CASCADE

-- Add certificate_id column if it doesn't exist
ALTER TABLE ClientLedger ADD COLUMN IF NOT EXISTS certificate_id INTEGER;

-- Drop existing constraint if it exists (to avoid conflicts)
ALTER TABLE ClientLedger DROP CONSTRAINT IF EXISTS fk_clientledger_certificate_id;

-- Add foreign key constraint with ON DELETE CASCADE
ALTER TABLE ClientLedger ADD CONSTRAINT fk_clientledger_certificate_id
FOREIGN KEY (certificate_id) REFERENCES certificate_selections(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clientledger_certificate_id ON ClientLedger(certificate_id);

-- Add comment
COMMENT ON COLUMN ClientLedger.certificate_id IS 'Foreign key to certificate_selections(id) for cascade deletion';

-- Note: voucher_no and other fields remain for reporting purposes but are not used for deletion logic