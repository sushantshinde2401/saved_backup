-- Add expiry_date column to certificate_selections table
-- This script is idempotent and can be run multiple times safely

DO $$
BEGIN
    -- Check if the expiry_date column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'certificate_selections'
        AND column_name = 'expiry_date'
    ) THEN
        -- Add the expiry_date column
        ALTER TABLE certificate_selections ADD COLUMN expiry_date DATE;
        RAISE NOTICE 'Added expiry_date column to certificate_selections table';
    ELSE
        RAISE NOTICE 'expiry_date column already exists in certificate_selections table';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN certificate_selections.expiry_date IS 'Date when the certificate expires';