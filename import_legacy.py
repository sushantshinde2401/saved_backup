import os
import psycopg2
import pandas as pd
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

def parse_date(date_str):
    """Parse date from 'DD / MM / YYYY' format to 'YYYY-MM-DD'"""
    if pd.isna(date_str) or date_str.strip() == '':
        return None
    try:
        # Remove extra spaces and split
        parts = date_str.replace(' ', '').split('/')
        if len(parts) == 3:
            day, month, year = parts
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        return None
    except:
        return None

def main():
    # Database connection
    try:
        if 'DATABASE_URL' in os.environ:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
        else:
            conn = psycopg2.connect(
                host=os.environ['DB_HOST'],
                port=os.environ['DB_PORT'],
                dbname=os.environ['DB_NAME'],
                user=os.environ['DB_USER'],
                password=os.environ['DB_PASSWORD'],
                sslmode='require'
            )
        print("Connected to database")
    except Exception as e:
        print(f"Connection error: {e}")
        return

    # Read CSV
    try:
        df = pd.read_csv('legacy_data.csv')
        print(f"Total rows in CSV: {len(df)}")
    except Exception as e:
        print(f"Error reading CSV: {e}")
        conn.close()
        return

    # Prepare data
    data = []
    for _, row in df.iterrows():
        try:
            candidate_name = str(row['candidate_name']).strip()
            passport = str(row['passport']).strip()
            certificate_name = str(row['certificate_name']).strip()
            certificate_number = str(row['certificate_number']).strip()
            start_date = parse_date(row['start_date'])
            end_date = parse_date(row['end_date'])
            issue_date = parse_date(row['issue_date'])
            expiry_date = parse_date(row['expiry_date'])

            if not certificate_number or not candidate_name or not passport or not certificate_name or not issue_date:
                print(f"Skipping row due to missing required fields: {row}")
                continue

            data.append((
                candidate_name,
                passport,
                certificate_name,
                certificate_number,
                start_date,
                end_date,
                issue_date,
                expiry_date
            ))
        except Exception as e:
            print(f"Error processing row {row}: {e}")
            continue

    if not data:
        print("No valid data to insert")
        conn.close()
        return

    # Insert data
    insert_sql = """
    INSERT INTO legacy_certificates (
        candidate_name, passport, certificate_name, certificate_number,
        start_date, end_date, issue_date, expiry_date
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (certificate_number) DO NOTHING
    """

    inserted_count = 0
    with conn.cursor() as cur:
        try:
            cur.executemany(insert_sql, data)
            inserted_count = cur.rowcount
            conn.commit()
        except Exception as e:
            print(f"Error inserting data: {e}")
            conn.rollback()
            conn.close()
            return

    print(f"Successfully inserted {inserted_count} records")
    print(f"Skipped {len(data) - inserted_count} duplicates")

    conn.close()
    print("Connection closed")

if __name__ == "__main__":
    main()