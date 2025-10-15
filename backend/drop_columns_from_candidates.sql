-- Script to drop specified columns from candidates table
-- This script removes the following columns: candidate_folder, candidate_folder_path,
-- image1-image6 (BYTEA), image1_name-image6_name, image1_type-image6_type,
-- images_metadata, images_data

-- First drop the view that depends on these columns
DROP VIEW IF EXISTS candidates_with_images;

-- Drop the specified columns if they exist (using CASCADE to drop dependent objects)
ALTER TABLE candidates DROP COLUMN IF EXISTS candidate_folder CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS candidate_folder_path CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image1 CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image1_name CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image1_type CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image2 CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image2_name CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image2_type CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image3 CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image3_name CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image3_type CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image4 CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image4_name CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image4_type CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image5 CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image5_name CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image5_type CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image6 CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image6_name CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS image6_type CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS images_metadata CASCADE;
ALTER TABLE candidates DROP COLUMN IF EXISTS images_data CASCADE;