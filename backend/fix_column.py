import psycopg2
from config import Config

# Direct database connection to check and alter columns
conn = psycopg2.connect(
    host=Config.DB_HOST,
    port=Config.DB_PORT,
    database=Config.DB_NAME,
    user=Config.DB_USER,
    password=Config.DB_PASSWORD,
    sslmode=Config.DB_SSL_MODE
)

try:
    with conn.cursor() as cursor:
        # Check all VARCHAR columns in ReceiptInvoiceData table
        cursor.execute('SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = \'receiptinvoicedata\' AND data_type = \'character varying\' ORDER BY column_name')
        results = cursor.fetchall()

        print('Current VARCHAR columns in ReceiptInvoiceData table:')
        for result in results:
            print(f'  {result[0]}: {result[1]}({result[2]})')

        # Alter all VARCHAR columns that are still 50 characters or less
        columns_to_alter = []
        for result in results:
            if result[2] <= 50:
                columns_to_alter.append(result[0])

        if columns_to_alter:
            print(f'\nAltering columns: {columns_to_alter}')
            for column in columns_to_alter:
                cursor.execute(f'ALTER TABLE ReceiptInvoiceData ALTER COLUMN {column} TYPE VARCHAR(500)')
                print(f'Successfully altered {column} to VARCHAR(500)')

            conn.commit()
            print('All alterations committed successfully')

            # Verify the changes
            cursor.execute('SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = \'receiptinvoicedata\' AND data_type = \'character varying\' ORDER BY column_name')
            results2 = cursor.fetchall()

            print('\nAfter alteration:')
            for result in results2:
                print(f'  {result[0]}: {result[1]}({result[2]})')
        else:
            print('\nAll VARCHAR columns are already 500 characters or larger')

except Exception as e:
    print(f'Error: {e}')
    conn.rollback()
finally:
    conn.close()