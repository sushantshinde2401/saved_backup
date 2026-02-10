-- Alter Master_Database_Table_A to support multiple rows per candidate
-- Add id column as primary key and remove primary key from candidate_id

-- Add the id column
ALTER TABLE Master_Database_Table_A ADD COLUMN id SERIAL PRIMARY KEY;

-- Drop the primary key constraint on candidate_id
-- Note: This assumes the constraint is named automatically, adjust if named differently
ALTER TABLE Master_Database_Table_A DROP CONSTRAINT IF EXISTS master_database_table_a_pkey;

-- Optionally, add an index on candidate_id for performance
CREATE INDEX IF NOT EXISTS idx_master_database_table_a_candidate_id ON Master_Database_Table_A(candidate_id);