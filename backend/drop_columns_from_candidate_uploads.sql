-- Script to drop specified columns from candidate_uploads table
-- This script removes the following columns: file_path, json_data, ocr_data, certificate_selections,
-- candidate_folder, candidate_folder_path, is_current_candidate, is_certificate_selection

-- Drop the specified columns if they exist (using CASCADE to drop dependent objects)
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS file_path CASCADE;
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS json_data CASCADE;
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS ocr_data CASCADE;
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS certificate_selections CASCADE;
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS candidate_folder CASCADE;
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS candidate_folder_path CASCADE;
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS is_current_candidate CASCADE;
ALTER TABLE candidate_uploads DROP COLUMN IF EXISTS is_certificate_selection CASCADE;