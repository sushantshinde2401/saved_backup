-- Script to add composite unique constraint on (id, candidate_name) in candidates table
-- This is required for the composite foreign key in certificate_selections table

-- Add unique constraint on (id, candidate_name) if it doesn't exist
-- Note: Since id is PRIMARY KEY, this constraint is technically redundant but required for foreign key reference
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'candidates_id_candidate_name_unique'
        AND conrelid = 'candidates'::regclass
    ) THEN
        ALTER TABLE candidates ADD CONSTRAINT candidates_id_candidate_name_unique UNIQUE (id, candidate_name);
        RAISE NOTICE 'Added unique constraint candidates_id_candidate_name_unique on (id, candidate_name)';
    ELSE
        RAISE NOTICE 'Unique constraint candidates_id_candidate_name_unique already exists';
    END IF;
END $$;