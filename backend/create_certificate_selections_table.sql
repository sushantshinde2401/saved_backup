-- Script to create certificate_selections table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS certificate_selections (
    id SERIAL PRIMARY KEY NOT NULL,
    candidate_id INT NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    certificate_name VARCHAR(255) NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    verification_image BYTEA,
    certificate_image BYTEA,
    -- Foreign key constraints
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (candidate_name) REFERENCES candidates(candidate_name) ON DELETE CASCADE ON UPDATE CASCADE,
    -- Composite foreign key constraint
    FOREIGN KEY (candidate_id, candidate_name) REFERENCES candidates(id, candidate_name) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for better query performance on composite key
CREATE INDEX IF NOT EXISTS idx_certificate_selections_candidate_id_name ON certificate_selections(candidate_id, candidate_name);

-- Add comments for documentation
COMMENT ON TABLE certificate_selections IS 'Stores certificate details for each candidate with referential integrity';
COMMENT ON COLUMN certificate_selections.id IS 'Unique identifier for each certificate selection record';
COMMENT ON COLUMN certificate_selections.candidate_id IS 'Foreign key referencing candidates(id)';
COMMENT ON COLUMN certificate_selections.candidate_name IS 'Foreign key referencing candidates(candidate_name)';
COMMENT ON COLUMN certificate_selections.client_name IS 'Client name extracted from candidate json_data';
COMMENT ON COLUMN certificate_selections.certificate_name IS 'Name of the certificate';
COMMENT ON COLUMN certificate_selections.creation_date IS 'Timestamp when the record was created';
COMMENT ON COLUMN certificate_selections.verification_image IS 'Binary data for verification image';
COMMENT ON COLUMN certificate_selections.certificate_image IS 'Binary data for certificate image';

-- Grant permissions (adjust as needed for your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON certificate_selections TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE certificate_selections_id_seq TO your_app_user;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'certificate_selections table created successfully with constraints and indexes';
    RAISE NOTICE 'Table structure:';
    RAISE NOTICE '- id: SERIAL PRIMARY KEY NOT NULL';
    RAISE NOTICE '- candidate_id: INT NOT NULL (FK to candidates.id)';
    RAISE NOTICE '- candidate_name: VARCHAR(255) NOT NULL (FK to candidates.candidate_name)';
    RAISE NOTICE '- client_name: VARCHAR(255)';
    RAISE NOTICE '- certificate_name: VARCHAR(255) NOT NULL';
    RAISE NOTICE '- creation_date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL';
    RAISE NOTICE '- verification_image: BYTEA';
    RAISE NOTICE '- certificate_image: BYTEA';
    RAISE NOTICE '';
    RAISE NOTICE 'Constraints:';
    RAISE NOTICE '- Foreign key on candidate_id';
    RAISE NOTICE '- Foreign key on candidate_name';
    RAISE NOTICE '- Composite foreign key on (candidate_id, candidate_name)';
    RAISE NOTICE '- All foreign keys have ON DELETE CASCADE and ON UPDATE CASCADE';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created:';
    RAISE NOTICE '- idx_certificate_selections_candidate_id_name on (candidate_id, candidate_name)';
END $$;