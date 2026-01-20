#!/usr/bin/env python3
"""
Script to read course data from Excel file and insert into PostgreSQL database.
"""

import os
import sys
import openpyxl
from database.db_connection import execute_query
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def read_excel_file(file_path):
    """
    Read the Excel file and return data rows.

    Args:
        file_path (str): Path to the Excel file

    Returns:
        list: List of dictionaries with course data
    """
    try:
        workbook = openpyxl.load_workbook(file_path, data_only=True)
        sheet = workbook.active

        data = []
        # Skip header row (row 1)
        for row in sheet.iter_rows(min_row=2, values_only=True):
            if row[0] is not None:  # Check if ID exists
                course_data = {
                    'id': int(row[0]),
                    'course_name': str(row[1]) if row[1] else '',
                    'topics': str(row[2]) if row[2] else ''
                }
                data.append(course_data)

        logger.info(f"Successfully read {len(data)} rows from Excel file")
        return data

    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        raise

def create_courses_table():
    """
    Create the courses table, dropping it first if it exists to ensure new structure.
    """
    # Drop table if it exists to ensure clean recreation with new columns
    drop_table_query = "DROP TABLE IF EXISTS courses"

    create_table_query = """
        CREATE TABLE courses (
            id INTEGER PRIMARY KEY,
            course_id VARCHAR(10) UNIQUE NOT NULL,
            course_name VARCHAR(255) NOT NULL,
            topics TEXT
        )
    """

    try:
        execute_query(drop_table_query, fetch=False)
        logger.info("Dropped existing courses table (if it existed)")
        execute_query(create_table_query, fetch=False)
        logger.info("Courses table created with new structure")
    except Exception as e:
        logger.error(f"Error creating courses table: {e}")
        raise

def insert_course_data(course_data, course_index):
    """
    Insert course data into the database.

    Args:
        course_data (dict): Course data to insert
        course_index (int): Sequential index for course_id generation (0-based)

    Returns:
        bool: True if successful, False otherwise
    """
    # Generate course_id: "02" + 3-digit sequential number starting from 001
    sequential_number = course_index + 1  # 1-based for 001, 002, etc.
    course_id = f"02{sequential_number:03d}"

    insert_query = """
        INSERT INTO courses (id, course_id, course_name, topics)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING
    """

    try:
        result = execute_query(insert_query, (course_data['id'], course_id, course_data['course_name'], course_data['topics']), fetch=False)
        logger.info(f"Inserted course: {course_data['course_name']} with course_id: {course_id}")
        return True
    except Exception as e:
        logger.error(f"Error inserting course ID {course_data['id']}: {e}")
        return False

def main():
    """
    Main function to execute the data import process.
    """
    # Excel file path
    excel_file_path = os.path.join(os.path.dirname(__file__), '..', 'COURSE NAMES  & TOPICS.xlsx')

    if not os.path.exists(excel_file_path):
        logger.error(f"Excel file not found: {excel_file_path}")
        sys.exit(1)

    try:
        # Read data from Excel
        logger.info("Reading data from Excel file...")
        courses_data = read_excel_file(excel_file_path)

        if not courses_data:
            logger.warning("No data found in Excel file")
            return

        # Create table if needed
        logger.info("Ensuring courses table exists...")
        create_courses_table()

        # Insert data
        logger.info("Inserting course data into database...")
        successful_inserts = 0
        failed_inserts = 0

        for index, course in enumerate(courses_data):
            if insert_course_data(course, index):
                successful_inserts += 1
            else:
                failed_inserts += 1

        # Summary
        total_rows = len(courses_data)
        logger.info("=" * 50)
        logger.info("DATA IMPORT SUMMARY")
        logger.info("=" * 50)
        logger.info(f"Total rows processed: {total_rows}")
        logger.info(f"Successful inserts: {successful_inserts}")
        logger.info(f"Failed inserts: {failed_inserts}")
        logger.info(f"Skipped (duplicates): {total_rows - successful_inserts - failed_inserts}")

        if failed_inserts > 0:
            logger.warning(f"⚠️  {failed_inserts} rows failed to insert. Check logs for details.")
        else:
            logger.info("✅ All rows processed successfully!")

    except Exception as e:
        logger.error(f"Script execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()