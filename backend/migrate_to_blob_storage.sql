-- Migration script to add BLOB storage to candidate_uploads table
-- This script adds BYTEA columns for storing file data directly in the database

-- Add new columns for BLOB storage
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS file_data BYTEA;
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- Make file_path nullable for BLOB storage records
ALTER TABLE candidate_uploads ALTER COLUMN file_path DROP NOT NULL;

-- Add additional columns for better organization
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS candidate_folder VARCHAR(255);
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS candidate_folder_path VARCHAR(500);
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS ocr_data JSONB;
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS is_current_candidate BOOLEAN DEFAULT FALSE;
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS is_certificate_selection BOOLEAN DEFAULT FALSE;
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE candidate_uploads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add constraints (check if they exist first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'check_file_size'
                   AND table_name = 'candidate_uploads') THEN
        ALTER TABLE candidate_uploads ADD CONSTRAINT check_file_size
            CHECK (file_size IS NULL OR file_size <= 10485760);
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_session_id ON candidate_uploads(session_id);
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_is_current ON candidate_uploads(is_current_candidate) WHERE is_current_candidate = TRUE;
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_ocr_data ON candidate_uploads USING GIN(ocr_data);
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_has_blob ON candidate_uploads(id) WHERE file_data IS NOT NULL;

-- Update comments for documentation
COMMENT ON COLUMN candidate_uploads.file_data IS 'Binary file data stored directly in database';
COMMENT ON COLUMN candidate_uploads.file_size IS 'Size of the file in bytes';
COMMENT ON COLUMN candidate_uploads.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN candidate_uploads.session_id IS 'Session ID for grouping related uploads';
COMMENT ON COLUMN candidate_uploads.ocr_data IS 'OCR processing results in JSON format';
COMMENT ON COLUMN candidate_uploads.is_current_candidate IS 'Flag indicating if this is the current active candidate';
COMMENT ON COLUMN candidate_uploads.is_certificate_selection IS 'Flag indicating if this contains certificate selections';

-- Display migration completion message
DO $$
BEGIN
    RAISE NOTICE 'BLOB storage migration completed successfully';
    RAISE NOTICE 'New columns added:';
    RAISE NOTICE '- file_data: BYTEA (binary file storage)';
    RAISE NOTICE '- file_size: BIGINT (file size in bytes)';
    RAISE NOTICE '- mime_type: VARCHAR(100) (MIME type)';
    RAISE NOTICE '- session_id: VARCHAR(100) (session grouping)';
    RAISE NOTICE '- ocr_data: JSONB (OCR results)';
    RAISE NOTICE '- is_current_candidate: BOOLEAN (current candidate flag)';
    RAISE NOTICE '- is_certificate_selection: BOOLEAN (certificate selection flag)';
    RAISE NOTICE '- last_updated: TIMESTAMP (last update timestamp)';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created for performance optimization';
END $$;