-- Script to create candidate_uploads table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidate_uploads (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    json_data JSONB
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_candidate_name ON candidate_uploads(candidate_name);
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_upload_time ON candidate_uploads(upload_time);
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_file_type ON candidate_uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_json_data ON candidate_uploads USING GIN(json_data);

-- Add a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_candidate_time ON candidate_uploads(candidate_name, upload_time);

-- Add comments for documentation
COMMENT ON TABLE candidate_uploads IS 'Stores metadata and JSON data for candidate file uploads';
COMMENT ON COLUMN candidate_uploads.candidate_name IS 'Name of the candidate (e.g., FirstName_LastName_PassportNo)';
COMMENT ON COLUMN candidate_uploads.file_name IS 'Original filename of the uploaded file';
COMMENT ON COLUMN candidate_uploads.file_type IS 'File extension/type (e.g., jpg, pdf, png)';
COMMENT ON COLUMN candidate_uploads.file_path IS 'Full path to the file on disk';
COMMENT ON COLUMN candidate_uploads.upload_time IS 'Timestamp when the file was uploaded';
COMMENT ON COLUMN candidate_uploads.json_data IS 'Structured form data and metadata in JSON format';

-- Grant permissions (adjust as needed for your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON candidate_uploads TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE candidate_uploads_id_seq TO your_app_user;

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW candidate_uploads_view AS
SELECT
    id,
    candidate_name,
    file_name,
    file_type,
    file_path,
    upload_time,
    json_data->>'firstName' as first_name,
    json_data->>'lastName' as last_name,
    json_data->>'passport' as passport,
    json_data->>'email' as email,
    json_data->>'phone' as phone,
    json_data->>'nationality' as nationality,
    json_data->>'dob' as date_of_birth,
    json_data->>'cdcNo' as cdc_number,
    json_data->>'indosNo' as indos_number,
    json_data->>'companyName' as company_name,
    json_data->>'vendorName' as vendor_name,
    json_data->>'paymentStatus' as payment_status,
    json_data->>'rollNo' as roll_number,
    json_data->>'session_id' as session_id,
    json_data->>'timestamp' as form_timestamp,
    json_data->>'submission_timestamp' as submission_timestamp,
    json_data->>'candidate_folder' as candidate_folder,
    json_data->>'candidate_folder_path' as candidate_folder_path
FROM candidate_uploads;

-- Grant permissions on the view
-- GRANT SELECT ON candidate_uploads_view TO your_app_user;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'candidate_uploads table created successfully with indexes and constraints';
    RAISE NOTICE 'Table structure:';
    RAISE NOTICE '- id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- candidate_name: VARCHAR(100) NOT NULL';
    RAISE NOTICE '- file_name: VARCHAR(255) NOT NULL';
    RAISE NOTICE '- file_type: VARCHAR(50) NOT NULL';
    RAISE NOTICE '- file_path: VARCHAR(500) NOT NULL';
    RAISE NOTICE '- upload_time: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '- json_data: JSONB';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created:';
    RAISE NOTICE '- idx_candidate_uploads_candidate_name';
    RAISE NOTICE '- idx_candidate_uploads_upload_time';
    RAISE NOTICE '- idx_candidate_uploads_file_type';
    RAISE NOTICE '- idx_candidate_uploads_json_data (GIN index)';
    RAISE NOTICE '- idx_candidate_uploads_candidate_time (composite)';
    RAISE NOTICE '';
    RAISE NOTICE 'View created: candidate_uploads_view';
END $$;