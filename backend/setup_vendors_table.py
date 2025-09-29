#!/usr/bin/env python3
"""
Database setup script for Vendors table
This script creates the Vendors table and inserts data from vendors.csv
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from config import Config

def create_vendors_table():
    """Create the Vendors table if it doesn't exist"""
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        conn.autocommit = True

        create_table_sql = """
        CREATE TABLE IF NOT EXISTS vendors (
            id SERIAL PRIMARY KEY,
            vendor_name TEXT,
            account_number TEXT,
            gst_number TEXT,
            address TEXT,
            email TEXT,
            phone TEXT,
            unused1 TEXT,
            unused2 TEXT,
            company_name TEXT,
            contact_person TEXT,
            pan_number TEXT,
            city TEXT,
            state TEXT,
            pincode TEXT,
            country TEXT,
            alternate_phone TEXT,
            bank_name TEXT,
            bank_account_number TEXT,
            ifsc_code TEXT,
            branch_name TEXT,
            vendor_type TEXT,
            payment_terms TEXT,
            credit_limit INTEGER,
            is_active BOOLEAN,
            notes TEXT
        );
        """

        with conn.cursor() as cursor:
            cursor.execute(create_table_sql)
            print("[DB] ✅ Vendors table created successfully")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ Failed to create Vendors table: {e}")
        return False

def insert_vendors_data():
    """Insert vendor data from CSV"""
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        conn.autocommit = True

        # CSV data (excluding header)
        csv_data = [
            [1, "Auburn Institute of Maritime Training", None, None, "B-408, GREAT EASTERN SUMMIT, SECTOR 15, CBD BELAPUR, NAVI MUMBAI", "certificate@auburninstitute.com", "+91-22-4974 4800", "", "", "AIMS MARITIME", "Certificate Department", None, "Navi Mumbai", "Maharashtra", "400614", "India", "+91 9870426846", None, None, None, None, "TRAINING_INSTITUTE", None, 0, True, "Maritime Training Institute"],
            [2, "Asha International Institute of Marine Technology", None, None, "3rd floor, Citi Tower, C Wing, Sector 15, CBD Belapur", "aiimtmumbai@aiimtvns.com", "1800 102 2066", "", "", "ASHA MARINE", "Training Department", None, "Navi Mumbai", "Maharashtra", "400614", "India", None, None, None, None, None, "TRAINING_INSTITUTE", None, 0, True, "Marine Technology Institute"],
            [3, "Management of Certification Services & Training Academy Foundation", None, None, "Office No F42, Haware Fantasia Business Park, Plot No 47, Sector 30A, Vashi", "info@mocataf.org", "+91 22 2781 9514", "", "", "BDI OFFSHORE", "Ruchi Singh", None, "Navi Mumbai", "Maharashtra", "400703", "India", "8291079323", None, None, None, None, "CERTIFICATION_SERVICES", None, 0, True, "Certification Services & Training"],
            [4, "Consulate General of Panama", None, None, "7th Floor Apeejay House, Dinsha Vacha Rd, Churchgate", "pconsulate@gmail.com", "022 6907 4040", "", "", "Consulate General of Panama", "Consulate Officer", None, "Mumbai", "Maharashtra", "400020", "India", "91 9867796268", None, "4.09001E+11", None, None, "GOVERNMENT", None, 0, True, "Panama Consulate Services"],
            [5, "Coral Nautical Ventures LLP", None, None, "Unit No. 07, The Great Eastern Galleria, Sector-04, Plot No 20, Nerul West", "docs.panamacourses@gmail.com", "88799 95757", "", "", "CORAL", "Documentation Team", None, "Navi Mumbai", "Maharashtra", "400706", "India", None, None, "2.01004E+11", None, None, "NAUTICAL_SERVICES", None, 0, True, "Nautical Ventures & Panama Courses"],
            [6, "D I Marine", None, None, "Belapur", "dimarine2025@gmail.com", "9198198 42497", "", "", "DI MARINE", "Marine Officer", None, "Navi Mumbai", "Maharashtra", None, "India", None, None, "9.2302E+14", None, None, "MARINE_SERVICES", None, 0, True, "Marine Services Provider"],
            [7, "Girik Institute of Maritime Studies", None, None, "Office No. 126, 1st Floor, B-Wing, Sai Chamber, Sec-11, CBD Belapur", "info@girikworld.com", "91-8828102576", "", "", "GIRIK", "Institute Admin", None, "Navi Mumbai", "Maharashtra", "400614", "India", None, None, "1.83102E+14", None, None, "TRAINING_INSTITUTE", None, 0, True, "Maritime Studies Institute"],
            [8, "Global Maritime Consultants Group", None, None, "707, One Platinum, Plot No 8, Sector 15, CBD Belapur", "seafarers.india@gmcg.global", None, "", "", "GMCG", "Consultant", None, "Navi Mumbai", "Maharashtra", "400614", "India", None, None, None, None, None, "CONSULTANT", None, 0, True, "Maritime Consultancy Services"],
            [9, "Gurna Shipping Company", None, None, "A-402, Platinum Palazzo, Plot No. 15, Sector 24, Khandeshwar", "gurnashippingcompany2@gmail.com", "98190 99266", "", "", "GURNA", "Shipping Manager", None, "Navi Mumbai", "Maharashtra", "410206", "India", None, None, None, None, None, "SHIPPING_COMPANY", None, 0, True, "Shipping Services"],
            [10, "Joe Mascarenhas", None, None, "Goa", None, "83780 90429", "", "", "JOE GOA", "Joe Mascarenhas", None, "Goa", "Goa", None, "India", None, None, None, None, None, "INDIVIDUAL_CONTRACTOR", None, 0, True, "Individual Service Provider - GPay: 83780 90429"],
            [11, "Seafarers Certifications and Services", None, None, "DBS Business Center, Bldg. No.213, Raheja Chambers, Nariman Point", "info@scsmaritime.com", "+507 6110 9062", "", "", "JOSE", "Jose", None, "Mumbai", "Maharashtra", "400021", "India", "+507 6636 6505", None, "4.09001E+11", None, None, "CERTIFICATION_SERVICES", None, 0, True, "Panama Office: Centennial Building, Office 706B - Panama City"],
            [12, "RS Enterprises", None, None, "Belapur", "kscservices2021@gmail.com", None, "", "", "KSC", "KSC Services", None, "Navi Mumbai", "Maharashtra", "400059", "India", None, None, "1.27105E+11", None, None, "SERVICE_PROVIDER", None, 0, True, "General Services"],
            [13, "Globus Marine Services", None, None, "Office No.-121, NBC Complex, Sector 11, Above Sarja Hotel, CBD Belapur", "allflagdoc@gmail.com", "+91 7400475444", "", "", "NISHU", "Nishu", None, "Navi Mumbai", "Maharashtra", "400614", "India", "8169880878", "DFC FIRST BANK", "10082054955", None, None, "MARINE_SERVICES", None, 0, True, "Flag Documentation Services"],
            [14, "Shri Mahavir Maritime Academy", None, None, "Plot No: 30/28, Knowledge Park III", "documentpanama@gmail.com", "9.19355E+11", "", "", "NOIDA", "Academy Admin", None, "Greater Noida", "Uttar Pradesh", "201308", "India", "9355000147", None, "5.02001E+13", None, None, "TRAINING_INSTITUTE", None, 0, True, "Latin Indo Marine Registry"],
            [15, "Palkan Marine Services Pvt. Ltd.", None, None, "504, 5th Floor, Pujit Plaza, Sector-11, Plot No-67, CBD Belapur", "palkanmarine@gmail.com", "022 4974 4370", "", "", "PALKAN MARINE", "Marine Manager", None, "Navi Mumbai", "Maharashtra", "400614", "India", "9987831290", None, "87301002795", None, None, "MARINE_SERVICES", None, 0, True, "Marine Services Private Limited"],
            [16, "Prudence Marine Services Pvt. Ltd.", None, None, "203, Town Centre 1, Andheri-Kurla Rd, Marol, Andheri East", "certifications@prudencemarine.in", "91 22 4143300", "", "", "Prudence", "Certifications Team", None, "Mumbai", "Maharashtra", "400059", "India", "+91 8779108246", "AXIS BANK LTD", "9.1802E+14", None, None, "MARINE_SERVICES", None, 0, True, "Marine Documentation & Certifications"],
            [17, "Shri Swami Samarth Clinic", None, None, "Balaji Bhavan, Belapur", "jadhav.sharwari@rediffmail.com", "90820 84209", "", "", "SAMARTH CLINIC", "Dr Birmode", None, "Navi Mumbai", "Maharashtra", None, "India", None, "IDFC FIRST BANK", "10072913773", None, None, "MEDICAL_SERVICES", None, 0, True, "STCW Medical Services"],
            [18, "Seafarers Training Center", None, None, "Ancon, Albrook, Street Diego Dominguez, P.H. Albrook Office Center", "seafarertrainingcenter@gmail.com", "(507) 375-0278", "", "", "STC", "Training Coordinator", None, "Panama City", "Panama", None, "Panama", "383-5980", None, None, None, None, "TRAINING_INSTITUTE", None, 0, True, "Panama Training Center"],
            [19, "Sun Marine Academy", None, None, "Office No 104, Foundation Tower, First Floor Plot No 20, Opposite PNB Bank Sector 11, Belapur", "infosunvalue@gmail.com", "99679 66841", "", "", "SUN MARINE", "Mukesh Singh", None, "Navi Mumbai", "Maharashtra", "400614", "India", None, None, None, None, None, "TRAINING_INSTITUTE", None, 0, True, "GPay: 99679 66841"],
            [20, "T S Rahaman", None, None, "S.M.Y Seaman Welfare Foundation, Nhava Campus, Panvel-Taluka", "v.kamath@tsrahaman.org", "022 27212 816", "", "", "TS RAHEMAN", "V. Kamath", None, "Panvel", "Maharashtra", "410206", "India", "+91 9819064600", "AXIS BANK LTD", "9.1801E+14", None, None, "WELFARE_FOUNDATION", None, 0, True, "Seaman Welfare Foundation"],
            [21, "Globus Marine Services", None, None, "Office No.-121, NBC Complex, Sector 11, Above Sarja Hotel, CBD Belapur", "allflagdoc@gmail.com", "+91 7400475444", "", "", "YOGESH RAI", "Yogesh Rai", None, "Navi Mumbai", "Maharashtra", "400614", "India", "8169880878", None, "10098469167", None, None, "MARINE_SERVICES", None, 0, True, "Flag Documentation Services"]
        ]

        insert_sql = """
        INSERT INTO vendors (
            id, vendor_name, account_number, gst_number, address, email, phone,
            unused1, unused2, company_name, contact_person, pan_number, city, state,
            pincode, country, alternate_phone, bank_name, bank_account_number,
            ifsc_code, branch_name, vendor_type, payment_terms, credit_limit, is_active, notes
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO NOTHING;
        """

        with conn.cursor() as cursor:
            for row in csv_data:
                cursor.execute(insert_sql, row)
            print(f"[DB] ✅ Inserted {len(csv_data)} vendor records successfully")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ Failed to insert vendor data: {e}")
        return False

def test_vendors_table():
    """Test the Vendors table by counting records"""
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )

        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM vendors")
            count = cursor.fetchone()[0]
            print(f"[DB] ✅ Vendors table test successful. Total records: {count}")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ Vendors table test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print(" VENDORS TABLE SETUP")
    print("=" * 60)

    try:
        # Step 1: Create table
        print("\n[STEP 1] Creating Vendors table...")
        if not create_vendors_table():
            return 1

        # Step 2: Insert data
        print("\n[STEP 2] Inserting vendor data...")
        if not insert_vendors_data():
            return 1

        # Step 3: Test table
        print("\n[STEP 3] Testing Vendors table...")
        if test_vendors_table():
            print("\n" + "=" * 60)
            print(" ✅ VENDORS TABLE SETUP COMPLETED SUCCESSFULLY")
            print("=" * 60)
            return 0
        else:
            print("\n" + "=" * 60)
            print(" ❌ VENDORS TABLE SETUP FAILED - TEST FAILED")
            print("=" * 60)
            return 1

    except Exception as e:
        print(f"\n[ERROR] Vendors table setup failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())