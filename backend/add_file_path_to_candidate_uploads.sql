-- Add file_path column to candidate_uploads table for file storage migration
ALTER TABLE candidate_uploads
ADD COLUMN file_path VARCHAR(500) NOT NULL DEFAULT '';

-- Add constraint to prevent null or empty file_path after migration
-- This will be enforced after migration is complete
-- ALTER TABLE candidate_uploads ADD CONSTRAINT chk_file_path_not_empty CHECK (file_path <> '');

-- Note: The constraint is commented out initially to allow gradual migration
-- Uncomment after all records have file_path populated