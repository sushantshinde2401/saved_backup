-- Script to create b2c_customer_details table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS b2c_customer_details (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    date_of_birth DATE,
    gender VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_b2c_full_name ON b2c_customer_details(full_name);
CREATE INDEX IF NOT EXISTS idx_b2c_email ON b2c_customer_details(email);
CREATE INDEX IF NOT EXISTS idx_b2c_phone ON b2c_customer_details(phone_number);
CREATE INDEX IF NOT EXISTS idx_b2c_created_at ON b2c_customer_details(created_at);

-- Add comments for documentation
COMMENT ON TABLE b2c_customer_details IS 'Stores B2C customer details for invoice generation';
COMMENT ON COLUMN b2c_customer_details.full_name IS 'Full name of the B2C customer';
COMMENT ON COLUMN b2c_customer_details.phone_number IS 'Phone number of the customer';
COMMENT ON COLUMN b2c_customer_details.email IS 'Email address of the customer';
COMMENT ON COLUMN b2c_customer_details.address IS 'Complete address of the customer';
COMMENT ON COLUMN b2c_customer_details.city IS 'City of the customer';
COMMENT ON COLUMN b2c_customer_details.state IS 'State of the customer';
COMMENT ON COLUMN b2c_customer_details.pincode IS 'PIN code of the location';
COMMENT ON COLUMN b2c_customer_details.date_of_birth IS 'Date of birth of the customer';
COMMENT ON COLUMN b2c_customer_details.gender IS 'Gender of the customer';
COMMENT ON COLUMN b2c_customer_details.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN b2c_customer_details.updated_at IS 'Timestamp when the record was last updated';