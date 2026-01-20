-- Add image_type column to candidate_uploads table
ALTER TABLE candidate_uploads
ADD COLUMN IF NOT EXISTS image_type VARCHAR(50);

-- Add index for image_type queries
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_image_type
ON candidate_uploads(image_type);

-- Update comment
COMMENT ON COLUMN candidate_uploads.image_type IS 'Type of image (photo, signature, passport_front, passport_back, cdc, marksheet, coc)';