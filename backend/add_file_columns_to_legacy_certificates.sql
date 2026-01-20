-- Add file-related columns to legacy_certificates table
ALTER TABLE legacy_certificates
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN legacy_certificates.file_path IS 'Path to the uploaded certificate file';
COMMENT ON COLUMN legacy_certificates.mime_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN legacy_certificates.file_size IS 'Size of the uploaded file in bytes';