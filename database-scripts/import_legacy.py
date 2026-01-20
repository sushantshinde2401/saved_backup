import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values
import pandas as pd

# Load environment variables from .env file
load_dotenv()

# Database credentials
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT', '5432')  # Default PostgreSQL port
    dbname = os.getenv('DB_NAME')
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"

# Connect to the database
conn = None
cursor = None
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Read CSV file
    df = pd.read_csv('legacy_data.csv')
    df.columns = df.columns.str.strip()

    # Parse date columns
    date_columns = ['start_date', 'end_date', 'issue_date', 'expiry_date']
    for col in date_columns:
        df[col] = pd.to_datetime(df[col], errors='coerce', dayfirst=True).dt.date
        df[col] = df[col].where(df[col].notna(), None)

    # Prepare data as list of tuples, selecting only required columns
    data = df[['candidate_name', 'passport', 'certificate_name', 'certificate_number', 'start_date', 'end_date', 'issue_date', 'expiry_date']].values.tolist()

    # Get count before insertion
    cursor.execute("SELECT COUNT(*) FROM legacy_certificates")
    before_count = cursor.fetchone()[0]

    # Insert query with ON CONFLICT
    query = """
    INSERT INTO legacy_certificates (candidate_name, passport, certificate_name, certificate_number, start_date, end_date, issue_date, expiry_date)
    VALUES %s
    ON CONFLICT (certificate_number) DO NOTHING
    """

    # Execute bulk insert
    execute_values(cursor, query, data)
    conn.commit()

    # Get count after insertion
    cursor.execute("SELECT COUNT(*) FROM legacy_certificates")
    after_count = cursor.fetchone()[0]

    # Calculate stats
    total_rows = len(df)
    inserted = after_count - before_count
    skipped = total_rows - inserted

    # Print results
    print(f"Total rows in CSV: {total_rows}")
    print(f"Successfully inserted records: {inserted}")
    print(f"Skipped duplicates: {skipped}")

except Exception as e:
    print(f"Error occurred: {e}")
    if conn:
        conn.rollback()
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()