-- Script to add foreign key constraint to candidate_uploads table
-- This ensures referential integrity between candidate_uploads and candidates tables

-- Step 3: Add foreign key constraint
-- First check if constraint already exists and drop it if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints
               WHERE constraint_name = 'fk_candidate_uploads_candidate'
               AND table_name = 'candidate_uploads') THEN
        ALTER TABLE candidate_uploads DROP CONSTRAINT fk_candidate_uploads_candidate;
        RAISE NOTICE 'Dropped existing foreign key constraint fk_candidate_uploads_candidate';
    END IF;
END $$;

-- Add the foreign key constraint with CASCADE delete
ALTER TABLE candidate_uploads
ADD CONSTRAINT fk_candidate_uploads_candidate
FOREIGN KEY (candidate_id)
REFERENCES candidates(candidate_id)
ON DELETE CASCADE;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Added foreign key constraint fk_candidate_uploads_candidate';
    RAISE NOTICE '   - References candidates(candidate_id)';
    RAISE NOTICE '   - ON DELETE CASCADE: Deleting a candidate will delete their uploads';
END $$;