-- Alter invoice_images table to add certificate_id foreign key
-- This script adds certificate_id column (if not exists) and sets up foreign key relationship with ON DELETE CASCADE

-- Add certificate_id column if it doesn't exist
ALTER TABLE invoice_images ADD COLUMN IF NOT EXISTS certificate_id INTEGER;

-- Drop existing constraint if it exists (to avoid conflicts)
ALTER TABLE invoice_images DROP CONSTRAINT IF EXISTS fk_invoice_images_certificate_id;

-- Add foreign key constraint with ON DELETE CASCADE
ALTER TABLE invoice_images ADD CONSTRAINT fk_invoice_images_certificate_id
FOREIGN KEY (certificate_id) REFERENCES certificate_selections(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_images_certificate_id ON invoice_images(certificate_id);

-- Add comment
COMMENT ON COLUMN invoice_images.certificate_id IS 'Foreign key to certificate_selections(id) for cascade deletion';

-- Note: invoice_no remains for reporting purposes but is not used for deletion logic