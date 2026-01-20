-- Alter certificate_selections table to match new Word template system requirements

-- Rename certificate_name to certificate_title
ALTER TABLE certificate_selections RENAME COLUMN certificate_name TO certificate_title;

-- Add course_id column
ALTER TABLE certificate_selections ADD COLUMN course_id INT;

-- Add issue_date column
ALTER TABLE certificate_selections ADD COLUMN issue_date DATE;

-- Add expiry_date column
ALTER TABLE certificate_selections ADD COLUMN expiry_date DATE;

-- Rename creation_date to created_at
ALTER TABLE certificate_selections RENAME COLUMN creation_date TO created_at;

-- Add status column if not exists (for tracking processing status)
ALTER TABLE certificate_selections ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Update comments
COMMENT ON COLUMN certificate_selections.certificate_title IS 'Title of the certificate/course from COURSES.xlsx';
COMMENT ON COLUMN certificate_selections.course_id IS 'ID of the selected course from COURSES.xlsx';
COMMENT ON COLUMN certificate_selections.issue_date IS 'Date when certificate was issued';
COMMENT ON COLUMN certificate_selections.expiry_date IS 'Date when certificate expires';
COMMENT ON COLUMN certificate_selections.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN certificate_selections.status IS 'Processing status: pending, processing, completed, failed';