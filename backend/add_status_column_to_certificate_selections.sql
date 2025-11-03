-- Add status column to certificate_selections table
-- This script is idempotent and can be run multiple times safely

DO $$
BEGIN
    -- Check if the status column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'certificate_selections'
        AND column_name = 'status'
    ) THEN
        -- Add the status column with default value 'pending'
        ALTER TABLE certificate_selections ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
        RAISE NOTICE 'Added status column to certificate_selections table with default value "pending"';
    ELSE
        RAISE NOTICE 'status column already exists in certificate_selections table';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN certificate_selections.status IS 'Status of the certificate: "pending" (default), "done" (finalized/billed), or NULL';