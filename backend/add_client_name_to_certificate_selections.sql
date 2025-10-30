-- Add client_name column to certificate_selections table
-- This script is idempotent and can be run multiple times safely

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'certificate_selections'
        AND column_name = 'client_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE certificate_selections ADD COLUMN client_name VARCHAR(255);
        RAISE NOTICE 'Added client_name column to certificate_selections table';
    ELSE
        RAISE NOTICE 'client_name column already exists in certificate_selections table';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN certificate_selections.client_name IS 'Client name extracted from candidate json_data';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'client_name column addition completed successfully';
    RAISE NOTICE 'Column details:';
    RAISE NOTICE '- client_name: VARCHAR(255) - Client name extracted from candidate json_data';
END $$;