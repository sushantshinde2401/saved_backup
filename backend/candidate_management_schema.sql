-- Candidate Management System Schema
-- This schema implements the candidate management system with separate image storage

-- Create candidate_uploads table for storing images separately
CREATE TABLE IF NOT EXISTS candidate_uploads (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255),
    session_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(10),
    file_data BYTEA, -- BLOB storage for images
    mime_type VARCHAR(100),
    file_size INTEGER,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, file_name) -- Prevent duplicate files in same session
);

-- Create indexes for candidate_uploads
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_session_id ON candidate_uploads(session_id);
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_candidate_name ON candidate_uploads(candidate_name);

-- Create candidates table (if not exists)
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255) UNIQUE NOT NULL,
    candidate_folder VARCHAR(255),
    candidate_folder_path TEXT,
    session_id VARCHAR(255), -- Links to images in candidate_uploads
    json_data JSONB, -- Candidate form data
    ocr_data JSONB, -- OCR extracted data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Image columns remain NULL as per requirements
    image1 BYTEA,
    image1_name VARCHAR(255),
    image1_type VARCHAR(10),
    image2 BYTEA,
    image2_name VARCHAR(255),
    image2_type VARCHAR(10),
    image3 BYTEA,
    image3_name VARCHAR(255),
    image3_type VARCHAR(10),
    image4 BYTEA,
    image4_name VARCHAR(255),
    image4_type VARCHAR(10),
    image5 BYTEA,
    image5_name VARCHAR(255),
    image5_type VARCHAR(10),
    image6 BYTEA,
    image6_name VARCHAR(255),
    image6_type VARCHAR(10),
    -- Alternative JSON structures (optional)
    images_metadata JSONB,
    images_data JSONB
);

-- Create indexes for candidates table
CREATE INDEX IF NOT EXISTS idx_candidates_session_id ON candidates(session_id);
CREATE INDEX IF NOT EXISTS idx_candidates_last_updated ON candidates(last_updated);

-- Add comments for documentation
COMMENT ON TABLE candidate_uploads IS 'Stores uploaded images separately to avoid bloating candidates table';
COMMENT ON TABLE candidates IS 'Main candidate data table with references to uploaded images';
COMMENT ON COLUMN candidates.session_id IS 'Session ID linking to images in candidate_uploads table';
COMMENT ON COLUMN candidate_uploads.session_id IS 'Session ID grouping related image uploads';

-- Create a view for easier querying of candidates with their images
CREATE OR REPLACE VIEW candidates_with_images AS
SELECT
    c.id,
    c.candidate_name,
    c.candidate_folder,
    c.candidate_folder_path,
    c.session_id,
    c.json_data,
    c.ocr_data,
    c.created_at,
    c.last_updated,
    -- Get image info from candidate_uploads
    ARRAY(
        SELECT json_build_object(
            'id', cu.id,
            'file_name', cu.file_name,
            'file_type', cu.file_type,
            'mime_type', cu.mime_type,
            'file_size', cu.file_size,
            'upload_time', cu.upload_time
        )
        FROM candidate_uploads cu
        WHERE cu.session_id = c.session_id
        ORDER BY cu.upload_time
        LIMIT 6
    ) as images
FROM candidates c;

-- Grant permissions (adjust as needed for your application)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON candidate_uploads TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON candidates TO your_app_user;
-- GRANT SELECT ON candidates_with_images TO your_app_user;