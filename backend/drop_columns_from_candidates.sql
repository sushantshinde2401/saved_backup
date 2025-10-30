-- Script to drop specified columns from candidates table
-- This script removes the following columns: is_current_candidate, is_certificate_selection, companyname

-- First drop any dependent views or constraints if they exist
DROP VIEW IF EXISTS candidates_with_images;

-- Drop the specified columns if they exist (using CASCADE to drop dependent objects)
ALTER TABLE candidates DROP COLUMN IF EXISTS is_current_candidate CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS is_certificate_selection CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS companyname CASCADE;

-- Drop any indexes that might be associated with these columns
DROP INDEX IF EXISTS idx_candidates_companyname;
DROP INDEX IF EXISTS idx_candidates_is_current;
DROP INDEX IF EXISTS idx_candidates_is_certificate;
DROP INDEX IF EXISTS idx_candidates_session_current;