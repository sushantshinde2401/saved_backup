-- Script to add candidate_id column to candidate_uploads table and establish proper relational linking
-- This script adds the candidate_id column, migrates existing data, and adds foreign key constraint

-- Step 1: Add candidate_id column
ALTER TABLE candidate_uploads
ADD COLUMN IF NOT EXISTS candidate_id INTEGER;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_candidate_id
ON candidate_uploads(candidate_id);

-- Add comment
COMMENT ON COLUMN candidate_uploads.candidate_id IS 'Foreign key reference to candidates(candidate_id)';

-- Display progress
DO $$
BEGIN
    RAISE NOTICE '✅ Added candidate_id column to candidate_uploads table';
END $$;