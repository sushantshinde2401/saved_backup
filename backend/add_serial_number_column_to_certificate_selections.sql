-- Add serial_number column to certificate_selections table
ALTER TABLE certificate_selections ADD COLUMN IF NOT EXISTS serial_number VARCHAR(4);

-- Add comment
COMMENT ON COLUMN certificate_selections.serial_number IS '4-digit sequential serial number for certificate numbering';