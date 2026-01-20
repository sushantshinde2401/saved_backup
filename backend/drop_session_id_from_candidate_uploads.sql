-- Script to safely remove session_id column from candidate_uploads table
-- This column is no longer needed since we now use candidate_id for proper relational linking

-- Check if session_id column exists and drop it
DO $$
BEGIN
    IF EXISTS (SELECT 1
               FROM information_schema.columns
               WHERE table_name = 'candidate_uploads'
               AND column_name = 'session_id') THEN

        -- Drop the index first if it exists
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'candidate_uploads' AND indexname = 'idx_candidate_uploads_session_id') THEN
            DROP INDEX idx_candidate_uploads_session_id;
            RAISE NOTICE 'Dropped index idx_candidate_uploads_session_id';
        END IF;

        -- Drop the column
        ALTER TABLE candidate_uploads DROP COLUMN session_id;
        RAISE NOTICE '✅ Successfully dropped session_id column from candidate_uploads table';

    ELSE
        RAISE NOTICE 'ℹ️  session_id column does not exist in candidate_uploads table - no action needed';
    END IF;
END $$;