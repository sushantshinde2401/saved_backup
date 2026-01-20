-- Add file_path column to invoice_images table for file storage migration
ALTER TABLE invoice_images
ADD COLUMN file_path VARCHAR(500) DEFAULT '';

-- Create index for file_path
CREATE INDEX IF NOT EXISTS idx_invoice_images_file_path
ON invoice_images(file_path);

-- Update existing records to have empty file_path (will be populated during migration)
UPDATE invoice_images
SET file_path = ''
WHERE file_path IS NULL;