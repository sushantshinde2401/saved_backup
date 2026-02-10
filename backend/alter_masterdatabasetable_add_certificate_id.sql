-- Alter Master_Database_Table_A table to add certificate_id foreign key
-- This script modifies certificate_id column type and sets up foreign key relationship with ON DELETE CASCADE

-- Note: certificate_id should already be INTEGER type. If it's not, this will handle conversion.
-- First, check if column exists and its type
DO $$
BEGIN
    -- Check if certificate_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'master_database_table_a'
        AND column_name = 'certificate_id'
    ) THEN
        -- If it exists, ensure it's INTEGER type
        ALTER TABLE Master_Database_Table_A ALTER COLUMN certificate_id TYPE INTEGER;
    ELSE
        -- If it doesn't exist, add it
        ALTER TABLE Master_Database_Table_A ADD COLUMN certificate_id INTEGER;
    END IF;
END $$;

-- Drop existing constraint if it exists (to avoid conflicts)
ALTER TABLE Master_Database_Table_A DROP CONSTRAINT IF EXISTS fk_masterdatabasetable_certificate_id;

-- Add foreign key constraint with ON DELETE CASCADE
ALTER TABLE Master_Database_Table_A ADD CONSTRAINT fk_masterdatabasetable_certificate_id
FOREIGN KEY (certificate_id) REFERENCES certificate_selections(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_masterdatabasetable_certificate_id ON Master_Database_Table_A(certificate_id);

-- Add comment
COMMENT ON COLUMN Master_Database_Table_A.certificate_id IS 'Foreign key to certificate_selections(id) for cascade deletion';

-- Note: candidate_id remains for reporting purposes but is not used for deletion logic