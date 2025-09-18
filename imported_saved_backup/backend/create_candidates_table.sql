-- Script to create candidates table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(100) UNIQUE NOT NULL,
    candidate_folder VARCHAR(255),
    candidate_folder_path VARCHAR(500),
    json_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_candidates_candidate_name ON candidates(candidate_name);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_candidates_json_data ON candidates USING GIN(json_data);

-- Add comments for documentation
COMMENT ON TABLE candidates IS 'Stores unique candidate information with consolidated data';
COMMENT ON COLUMN candidates.candidate_name IS 'Unique name of the candidate (e.g., FirstName_LastName_PassportNo)';
COMMENT ON COLUMN candidates.candidate_folder IS 'Name of the candidate folder';
COMMENT ON COLUMN candidates.candidate_folder_path IS 'Full path to the candidate folder';
COMMENT ON COLUMN candidates.json_data IS 'Consolidated candidate details in JSON format';
COMMENT ON COLUMN candidates.created_at IS 'Timestamp when the candidate record was created';

-- Grant permissions (adjust as needed for your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON candidates TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE candidates_id_seq TO your_app_user;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'candidates table created successfully with indexes and constraints';
    RAISE NOTICE 'Table structure:';
    RAISE NOTICE '- id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- candidate_name: VARCHAR(100) UNIQUE NOT NULL';
    RAISE NOTICE '- candidate_folder: VARCHAR(255)';
    RAISE NOTICE '- candidate_folder_path: VARCHAR(500)';
    RAISE NOTICE '- json_data: JSONB';
    RAISE NOTICE '- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created:';
    RAISE NOTICE '- idx_candidates_candidate_name';
    RAISE NOTICE '- idx_candidates_created_at';
    RAISE NOTICE '- idx_candidates_json_data (GIN index)';
END $$;