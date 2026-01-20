-- Alter certificate_selections table to change image columns from BYTEA to VARCHAR for file paths

-- First, clear existing binary data since we're changing to file paths
UPDATE certificate_selections SET verification_image = NULL WHERE verification_image IS NOT NULL;
UPDATE certificate_selections SET certificate_image = NULL WHERE certificate_image IS NOT NULL;

-- Change verification_image from BYTEA to VARCHAR(500)
ALTER TABLE certificate_selections ALTER COLUMN verification_image TYPE VARCHAR(500);

-- Change certificate_image from BYTEA to VARCHAR(500)
ALTER TABLE certificate_selections ALTER COLUMN certificate_image TYPE VARCHAR(500);

-- Update comments
COMMENT ON COLUMN certificate_selections.verification_image IS 'File path to the verification PDF document';
COMMENT ON COLUMN certificate_selections.certificate_image IS 'File path to the certificate PDF document';