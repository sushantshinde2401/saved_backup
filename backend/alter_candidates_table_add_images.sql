-- Script to add image BLOB columns to candidates table for consolidation
-- This script adds 6 image columns to store all candidate images in a single row

-- Add image BLOB columns to candidates table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS image1 BYTEA,
ADD COLUMN IF NOT EXISTS image2 BYTEA,
ADD COLUMN IF NOT EXISTS image3 BYTEA,
ADD COLUMN IF NOT EXISTS image4 BYTEA,
ADD COLUMN IF NOT EXISTS image5 BYTEA,
ADD COLUMN IF NOT EXISTS image6 BYTEA;

-- Add metadata columns for images
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS image1_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image2_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image3_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image4_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image5_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image6_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image1_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS image2_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS image3_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS image4_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS image5_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS image6_type VARCHAR(50);

-- Update comments
COMMENT ON COLUMN candidates.image1 IS 'First candidate image (BLOB data)';
COMMENT ON COLUMN candidates.image2 IS 'Second candidate image (BLOB data)';
COMMENT ON COLUMN candidates.image3 IS 'Third candidate image (BLOB data)';
COMMENT ON COLUMN candidates.image4 IS 'Fourth candidate image (BLOB data)';
COMMENT ON COLUMN candidates.image5 IS 'Fifth candidate image (BLOB data)';
COMMENT ON COLUMN candidates.image6 IS 'Sixth candidate image (BLOB data)';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Successfully added image BLOB columns to candidates table';
    RAISE NOTICE 'Table now supports consolidated storage of candidate data and images';
    RAISE NOTICE 'Added columns: image1-image6 (BYTEA), image1_name-image6_name, image1_type-image6_type';
END $$;