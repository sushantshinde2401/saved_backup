-- Script to migrate existing candidate_uploads data to use candidate_id instead of candidate_name
-- This script matches existing records using candidate_name and populates candidate_id

-- Step 2: Migrate existing data
-- Update candidate_uploads to set candidate_id based on matching candidate_name
UPDATE candidate_uploads cu
SET candidate_id = c.candidate_id
FROM candidates c
WHERE LOWER(TRIM(cu.candidate_name)) = LOWER(TRIM(c.candidate_name))
AND cu.candidate_id IS NULL;

-- Display migration results
DO $$
DECLARE
    migrated_count INTEGER;
    total_count INTEGER;
    unmatched_count INTEGER;
BEGIN
    -- Count successfully migrated records
    SELECT COUNT(*) INTO migrated_count
    FROM candidate_uploads
    WHERE candidate_id IS NOT NULL;

    -- Count total records
    SELECT COUNT(*) INTO total_count
    FROM candidate_uploads;

    -- Count unmatched records
    SELECT COUNT(*) INTO unmatched_count
    FROM candidate_uploads
    WHERE candidate_id IS NULL;

    RAISE NOTICE '📊 Migration Results:';
    RAISE NOTICE '   Total records: %', total_count;
    RAISE NOTICE '   Successfully migrated: %', migrated_count;
    RAISE NOTICE '   Unmatched records: %', unmatched_count;

    IF unmatched_count > 0 THEN
        RAISE NOTICE '⚠️  Warning: % records could not be matched by candidate_name', unmatched_count;
        RAISE NOTICE '   These records may need manual review or the candidates may not exist yet.';
    END IF;
END $$;