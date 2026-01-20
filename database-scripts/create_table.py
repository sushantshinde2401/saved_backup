import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

# Database credentials
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT', '5432')
    dbname = os.getenv('DB_NAME')
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"

# Connect and create table
conn = None
cursor = None
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # SQL to create table
    create_table_sql = """
    DROP TABLE IF EXISTS legacy_certificates;
    CREATE TABLE legacy_certificates (
        id SERIAL PRIMARY KEY,
        candidate_name TEXT NOT NULL,
        passport TEXT NOT NULL,
        certificate_name TEXT NOT NULL,
        certificate_number VARCHAR(255) UNIQUE NOT NULL,
        start_date DATE,
        end_date DATE,
        issue_date DATE,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """

    cursor.execute(create_table_sql)
    conn.commit()
    print("Table legacy_certificates created successfully (if it didn't exist).")

except Exception as e:
    print(f"Error: {e}")
    if conn:
        conn.rollback()
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()