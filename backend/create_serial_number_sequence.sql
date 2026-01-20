-- Create sequence for certificate serial numbers
-- Starts at 1, increments by 1, ensures atomic generation

CREATE SEQUENCE IF NOT EXISTS certificate_serial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Add comment
COMMENT ON SEQUENCE certificate_serial_seq IS 'Sequence for generating unique 4-digit serial numbers for certificates';