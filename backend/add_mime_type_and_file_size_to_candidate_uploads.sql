-- Add mime_type and file_size columns to candidate_uploads table
ALTER TABLE candidate_uploads
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_mime_type
ON candidate_uploads(mime_type);

CREATE INDEX IF NOT EXISTS idx_candidate_uploads_file_size
ON candidate_uploads(file_size);

-- Update comments
COMMENT ON COLUMN candidate_uploads.mime_type IS 'MIME type of the uploaded file (e.g., image/jpeg, application/pdf)';
COMMENT ON COLUMN candidate_uploads.file_size IS 'Size of the file in bytes';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Added mime_type and file_size columns to candidate_uploads table';
END $$;