-- Add companyname column to candidates table
-- This script adds the companyname column to store client information

ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS companyname VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN candidates.companyname IS 'Client company name selected from newstepper Client Info step';

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_candidates_companyname ON candidates(companyname);

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Company name column added to candidates table successfully';
    RAISE NOTICE 'Column: companyname VARCHAR(255)';
    RAISE NOTICE 'Index created: idx_candidates_companyname';
END $$;