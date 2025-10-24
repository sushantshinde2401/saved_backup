-- Complete schema consolidation for candidates table
-- This script adds all necessary fields to support consolidated candidate data storage

-- Add missing metadata fields to candidates table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ocr_data JSONB,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add image metadata arrays for better organization (optional alternative to individual columns)
-- These can store image info as JSON arrays if preferred over individual columns
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS images_metadata JSONB,
ADD COLUMN IF NOT EXISTS images_data JSONB; -- Alternative: store all images as base64 in JSON

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_candidates_session_id ON candidates(session_id);
CREATE INDEX IF NOT EXISTS idx_candidates_last_updated ON candidates(last_updated);

-- Add comments for documentation
COMMENT ON COLUMN candidates.session_id IS 'Session ID from upload process';
COMMENT ON COLUMN candidates.ocr_data IS 'OCR extracted data from images';
COMMENT ON COLUMN candidates.last_updated IS 'Last update timestamp';
COMMENT ON COLUMN candidates.images_metadata IS 'Metadata for all images as JSON array';
COMMENT ON COLUMN candidates.images_data IS 'Alternative: all images as base64 strings in JSON';

-- Optional: Create a view for easier querying of consolidated data
CREATE OR REPLACE VIEW consolidated_candidates_view AS
SELECT
    id,
    candidate_name,
    candidate_folder,
    candidate_folder_path,
    session_id,
    json_data,
    ocr_data,
    created_at,
    last_updated,
    -- Individual image columns
    image1, image1_name, image1_type,
    image2, image2_name, image2_type,
    image3, image3_name, image3_type,
    image4, image4_name, image4_type,
    image5, image5_name, image5_type,
    image6, image6_name, image6_type,
    -- Alternative JSON structure
    images_metadata,
    images_data
FROM candidates;

-- Grant permissions (uncomment and modify as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON consolidated_candidates_view TO your_app_user;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Candidates table schema consolidation completed';
    RAISE NOTICE 'Added fields: session_id, ocr_data, last_updated';
    RAISE NOTICE 'Added optional fields: images_metadata, images_data';
    RAISE NOTICE 'Created indexes and view for efficient querying';
    RAISE NOTICE '';
    RAISE NOTICE 'Table now supports complete consolidated storage of:';
    RAISE NOTICE '- Candidate personal data (json_data)';
    RAISE NOTICE '- OCR extracted data (ocr_data)';
    RAISE NOTICE '- OCR extracted data (ocr_data)';
    RAISE NOTICE '- Multiple images as BLOBs (image1-image6)';
    RAISE NOTICE '- Session and metadata tracking';
END $$;