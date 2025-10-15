#!/usr/bin/env python3
"""
Script to update B2B customer data by removing demo rows and inserting actual data from Excel
"""
import psycopg2
from config import Config

def update_b2b_customers():
    """Update B2B customers table with actual data"""

    conn = psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    cursor = conn.cursor()

    try:
        # First alter the phone_number column to VARCHAR(255) if needed
        cursor.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'b2bcustomersdetails'
                AND column_name = 'phone_number'
                AND data_type = 'character varying'
                AND character_maximum_length < 255
            ) THEN
                ALTER TABLE b2bcustomersdetails ALTER COLUMN phone_number TYPE VARCHAR(255);
                RAISE NOTICE 'Altered phone_number column to VARCHAR(255)';
            END IF;
        END $$;
        """)

        print("✅ Altered phone_number column to VARCHAR(255) if needed")

        # First delete records from related tables that reference the demo customers
        cursor.execute("""
        DELETE FROM client_adjustments
        WHERE customer_id IN (
            SELECT id FROM b2bcustomersdetails
            WHERE company_name IN (
                'Tech Solutions India Pvt Ltd',
                'Global Manufacturing Corp',
                'Digital Services Hub',
                'Logistics & Supply Chain Ltd',
                'Healthcare Solutions Inc',
                'Education Technology Pvt Ltd',
                'Construction & Engineering Co',
                'Retail Chain Solutions',
                'Automotive Parts Ltd',
                'Software Development Corp'
            )
        )
        """)

        print("✅ Deleted related records from client_adjustments")

        # Now delete the demo customers
        cursor.execute("""
        DELETE FROM b2bcustomersdetails WHERE company_name IN (
            'Tech Solutions India Pvt Ltd',
            'Global Manufacturing Corp',
            'Digital Services Hub',
            'Logistics & Supply Chain Ltd',
            'Healthcare Solutions Inc',
            'Education Technology Pvt Ltd',
            'Construction & Engineering Co',
            'Retail Chain Solutions',
            'Automotive Parts Ltd',
            'Software Development Corp'
        )
        """)

        print("✅ Deleted demo rows from b2bcustomersdetails")

        # Then insert new data from Excel
        insert_query = """
        INSERT INTO b2bcustomersdetails (company_name, gst_number, contact_person, phone_number, email, address, city, state, state_code, pincode) VALUES
        ('VIGHNAHARA SHIP MANAGEMENT PVT LTD', NULL, 'Vighnahara Ship Managenent Pvt Ltd', '+91-8506802182 +91-7011909150', 'doc.vshipm@gmail.com', 'Haware''s Centurion Mall', 'navi mumbai', 'Maharashtra', '27', '400706'),
        ('VIGHNAHARA SHIP MANAGEMENT PVT LTD', NULL, 'ARVIND DELHI', '+91-8506802182 +91-7011909150', 'doc.vshipm@gmail.com', 'Haware''s Centurion Mall', 'navi mumbai', 'Maharashtra', '27', '400706'),
        ('KSC', NULL, 'KSC', '+91 89764 85741', 'kscservices2021@gmail.com', NULL, NULL, NULL, NULL, NULL),
        ('Prudence Marine Services Pvt. Ltd.', NULL, 'PRUDENCE MARINE SERVICES PVTLTD', '+91 8657047708', 'certifications@prudencemarine.in', '203. Town Centre 1, Andheri – Kurla Rd. Marol, Andheri East, Mumbai – 400 059', 'mumbai', 'Maharashtra', '27', '400059'),
        ('Star Sea Management Pvt Ltd', NULL, 'STAR SEA', '+91 81080 90830', NULL, 'Plot No. 47, Office No S-181, 2nd Floor, Haware Fantasia Business Park Corporate Wing, Sector 30A, Vashi, Mumbai, Maharashtra 400703', 'navi mumbai', 'Maharashtra', '27', '400703'),
        ('Priti Maritime Services Pvt.Ltd.', NULL, 'CHANDRA KISHOR YADAV', '+91 99670 66931', 'info@pritimaritime.com', 'Office No- 218, D-wing, 1st Floor, Shanti Shopping Center, Opp. Mira Road Railway Station, Mira Road (East ) 401107, INDIA.', 'mumbai', 'Maharashtra', '27', '401107'),
        ('CONNECT ENERGY SERVICES DMCC', NULL, 'K STEAM - NILESH SURVE', 'T: +971 4 3699076 | M +91 9821626464', 'indiaops@connect-energy.com', '1505, JBC-2, Cluster V, Jumeirah Lakes Towers, Dubai, U.A.E. P O Box 338230', NULL, 'Dubai', NULL, NULL),
        ('GURNA SHIPPING COMPANY', NULL, 'GURNA', '+91 98190 99266', 'gurnashippingcompany2@gmail.com', 'A - 402, Platinum Palazzo, Plot No. 15, Sector 24, Khandeshwar Navi Mumbai - 410 206, Maharashtra, India', 'navi mumbai', 'Maharashtra', '27', '410206'),
        ('MAHADEVA SHIPPING & MANAGEMENT PVT. LTD.', NULL, 'MAHADEVA', 'M: +91-9321356782', 'documents.msmpl@gmail.com', 'Office no.-06, Sairama Real Estate, Plot no.-3A Sector-02,kharghar 410210 Navi Mumbai, India', 'navi mumbai', 'Maharashtra', '27', '410210'),
        ('ABHISHEK BONGAL', NULL, 'ABHISHEK BONGAL', '+91 98214 29969', 'abhishekbhogwal@gmail.com', NULL, NULL, NULL, NULL, NULL),
        ('SEA SPEED', NULL, 'SEA SPEED SHUBHAM', '+91 82868 47307', 'svj271296@gmail.com', 'BELAPUR, SECTOR 12', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('SHAGUF', NULL, 'SHAGUF', '+91 70584 56483', NULL, 'AMBARNATH', 'ambarnath', 'Maharashtra', '27', '421501'),
        ('Ocean Fortune Marine Pvt. Ltd.', '07AADCO6331Q1Z0', 'OCEAN FORTUNE', '9205556778', 'crewing@oceanfortunemarine.com managementoceanfortune@gmail.com tarun@oceanfortunemarine.com', 'Plot No.835,2nd Floor, Udyog Vihar. Phase - 5, sector 19, Gurugram - 122001.', 'gurugram', 'Haryana', '6', '122001'),
        ('SANDEEP RAJARSHI', NULL, 'SANDEEP RAJARSHI', '+91 99342 15283', NULL, 'MAHALAKSMI, MUMBAI', 'mumbai', 'Maharashtra', '27', '400011'),
        ('Glance One Ship Management Pvt. Ltd.', NULL, 'SHAILESH SHINDE GLANCE 1', '+91 97020 97828 Mob : +91 87793 77144 Phone:- 022 27742344 Mobile:- 91 8451938581', 'glanceone@gmail.com info@glanceone.com', '#108, Royal Palace Building Sector-2, Kharghar Navi Mumbai-410210', 'navi mumbai', 'Maharashtra', '27', '410210'),
        ('CORAL NAUTICAL VENTURES LLP', NULL, 'CORAL', '+91 9321147113 +91 8879995757', 'docs.panamacourses@gmail.com', 'balaji bhavan , belapur', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('MIKE', NULL, 'MIKE', '+91 95009 75554', NULL, 'Chennai', 'chennai', 'Tamil Nadu', '33', NULL),
        ('Priti Maritime Services Pvt.Ltd.', NULL, 'CHETAN JOSHI', '+91 98221 79154', 'pritimaritime473@gmail.com', 'Office No- 218, D-wing, 1st Floor, Shanti Shopping Center, Opp. Mira Road Railway Station, Mira Road (East ) 401107, INDIA.', 'mumbai', 'Maharashtra', '27', '401107'),
        ('Bhartiya Maritime Academy', NULL, 'SUNIL GODIYAL BHARTI SHIPPING', 'Phone: +91 9619597586', 'bhartimarinefoundation@gmail.com', 'Office No 1, Shree Apartment Plot No. C-8, Sector No.29, Agroli Village, CBD Belapur Navi Mumbai 400614 Maharashtra, India', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('DEEPA BUNGLA', NULL, 'DEEPA BUNGLA', '+91 98707 93404', NULL, 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('MUKESH SK', NULL, 'MUKESH SK', '+91 98335 01525', NULL, 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('MANSOOR ATLANZA', NULL, 'MANSOOR ATLANZA', '+91 93724 55022', 'atlanza786@gmail.com', 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('Naira Maritime Private Limited', NULL, 'BANU', '9867060206', 'banushaikh256@gmail.com', 'Kakal Building 1st Floor Office no.37, Goa Street ,S. B. S. Road Fort Mumbai', 'mumbai', 'Maharashtra', '27', '400001'),
        ('SEA SHIP', NULL, 'SACHIT DABARE', '+91 98505 30369', NULL, '912, 9th floor, Mayuresh Cosmos, Plot No. 37, Sector 11, CBD Belapur, Navi Mumbai, Maharashtra 400614', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('A SINGH', NULL, 'A SINGH DELHI', '+91 98105 53303', NULL, 'DELHI', 'delhi', NULL, '7', NULL),
        ('Satya Marine Services', NULL, 'SATYA MARINE SERVICES', '+91 91526 55066', NULL, NULL, NULL, NULL, NULL, NULL),
        ('SACHIT DABRE', NULL, 'SACHIT DABRE', '98505 30369', NULL, 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('MURLI JOSHI', NULL, 'MURLI JOSHI', '+91 98468 25699 +91 86558 97608', NULL, 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('D I Nautical Marine', NULL, 'DIMARINE', '+91 98198 42497', 'dimarine2024@gmail.com', '310, 3rd Floor, Gauri Complex, Sector – 11, CBD Belapur – 400614', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('ABB Ship Management Pvt.Ltd', NULL, 'ABB SHIPMANAGEMENT', 'Tel: 022 27560128 Mob: 85910 94011', 'docs@abbshipmanagement.com', 'Office No.83A & 84A ,Aggarwal Trade Center Sector -11, Plot No.62, CBD Belapur, Navi Mumbai-400614', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('PRITI MARITIME SERVICES PRIVATE LIMITED', NULL, 'RAJESH SINGH', 'MOB.NO- +919415353483', 'rajeshsingh9000@gmail.com', 'Office No:-218 ,D-Wing 1st Floor  , Shanti Shopping Centre Mira Road (East), Thane 401107, Maharashtra, India', 'mumbai', 'Maharashtra', '27', '401107'),
        ('DAKARCLASS PRIVATE LIMITED', NULL, 'RAJNISH ROY', '+91 7736505222 +91 6235179292', 'operations.india@dakarclass.com rajnish.roy@dakarclass.com arpit.ranjan@dakarclass.com', 'Office No.902, CBD 61 Four, Greenscape Shakti, Plot No.12, Sector 15, CBD Belapur, Navi Mumbai-400614', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('MANOJ UOSM', NULL, 'MANOJ UOSM', '96190 30198', NULL, 'SANDEEP SHEORON', NULL, NULL, NULL, NULL),
        ('WORLD SHIPS MANAGEMENT PVT.LTD.', NULL, 'WORLDSHIP', 'Tel. No. +91 22 27582727, Mob. No. : + 91 9930015877', 'crew.worldship@gmail.com info@worldship.in hr@worldship.in', 'NBC Complex,Off. No. 429,4th Floor, Plot No. 43, Sector 11, Opp. Belapur Station, Navi Mumbai, 400614', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('SANDEEP SHEORON', NULL, 'SANDEEP SHEORON', '88139 23231', NULL, 'SANDEEP SHEORON', NULL, NULL, NULL, NULL),
        ('PADDY BP MARINE', NULL, 'PADDY BP MARINE', '82913 96549', 'NA', NULL, NULL, NULL, NULL, NULL),
        ('KALPESH CHIKANE', NULL, 'KALPESH CHIKANE', '88509 65011', 'NA', 'AMBARNATH', 'ambernath', 'Maharashtra', '27', '421501'),
        ('Globus Marine Services', NULL, 'YOGESH RAI', 'M. +91 7400475444', 'allflagdoc@gmail.com', 'Office No.- 121, NBC Complex, Sector 11, Above Sarja Hotel, CBD Belapur, Navi Mumbai, Maharashtra, India - 400614', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('Sapphire Maritime Consultancy', NULL, 'MILIN 7 SEAS', '+91 98691 50665', 'spphiremaritime@gmail.com', 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('PAVIN MANGALAM', NULL, 'PAVIN MANGALAM', '93222 27258', 'NA', 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('DEEPAK YADAV SAGAR SIR', NULL, 'DEEPAK YADAV SAGAR SIR', '88982 50578', 'NA', 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('INTEGRI MARINE', NULL, 'AVKASH PATIL-INTEGRITI', '+91 99705 82253', 'avkash.patil@integrimarine.com', 'AKSHAR BUSINESS PARK, M 2041, Janta Market Rd, Sector 25, Vashi, Navi Mumbai, Maharashtra 400703', 'navi mumbai', 'Maharashtra', '27', '400703'),
        ('AMAN SINGH', NULL, 'AMAN SINGH', '91361 90210', NULL, 'BELAPUR SECTOR- 15', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('Palkan Marine Services Pvt. Ltd.', NULL, 'PALKAN MARINE', 'Ph: 022 4974 4370, Mob:9987831290', 'palkanmarine@gmail.com', '504, 5th Floor, Pujit Plaza, Sector - 11, Plot No - 67, CBD Belapur, Navi Mumbai (India) Pin – 400614', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('Massi Shipping LLC', 'N/ A', 'MASSI (DUBAI )', 'Tel: +971 4 2978840 Mob: +971 543514469', 'accounts@massi-shipping.com crewing@massi-shipping.com', 'Al Bakhit Center Office 401 Abu Baker Al Siddiqui Road, Deira, Dubai, United Arab Emirates', NULL, 'Dubai', NULL, NULL),
        ('BLUE OCEAN MARITIME', NULL, 'BLUE OCEAN  (DUBAI )', '+971503403110 +97165423630', 'seafarers@ocean-registrar.com info@ocean-registrar.com accounts@ocean-registrar.com', 'Office 2004, Tabarak Tower, Al Mamzar, Sharjah, United Arab Emirates', 'sharjah', NULL, NULL, NULL),
        ('Foresight Offshore Drilling Limited S.A.', NULL, 'FORESIGHT OFFSHORE DRILLING LTD S.A- DUBAI', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
        ('Foresight Offshore Drilling Limited S.A.', '27AADCH7845J2Z5', 'FORESIGHT OFFSHORE DRILLING LTD- MUMBAI', '+917045697351', 'r.picardo@foresight-group.com', 'ASM House, 07th Golibar Road, Santacruz, (East) Mumbai, Maharashtra, India – 400 055', 'mumbai', 'Maharashtra', '27', '400055'),
        ('Elegant Marine Services Pvt Ltd', NULL, 'ELEGANT', '+91 22 3090 6100 +91 98215 50043', 'sandeshkadam@elegantship.com', '401/A Elegant Business Park Off Andheri - Kurla Road Near Kohinoor Continental Hotel Andheri (East) Mumbai - 400 059', 'mumbai', 'Maharashtra', '27', '400059'),
        ('Foresight Offshore Drilling Limited S.A.', '27AADCH7845J2Z5', 'ANNIE SHETTY', '+91 84339 54334', 'a.shetty@foresight-group.com', 'ASM House, 07th Golibar Road, Santacruz, (East) Mumbai, Maharashtra, India – 400 055', 'mumbai', 'Maharashtra', '27', '400055'),
        ('ZAX MARINE SERVICES', '33AABCZ9801G1ZC', 'ZAX MARINE SERVICES', '+91 86101 35260', 'crew@zax-marine.com', 'Mysha Complex NO 1 Sfno 261/5A ECR Road Kappivakkam, Kancheepuram, Tamil Nadu 603302', 'kancheepuram', 'Tamil Nadu', '33', '603302'),
        ('Foresight Global Offshore Drilling PTE LTD', NULL, 'HARI HARAN  (DUBAI )', '+971 56 776 0773', 'p.hari@foresight-group.com', 'Office No. 16, 2nd Floor, Hanging Garden Tower, Hamdan Bin Mohammed Street, Al Danah, Zone 1, Abu Dhabi, UAE – 43051', 'Abu Dhabi', NULL, NULL, '43051'),
        ('OPUS MARIN', NULL, 'OPUS MARIN', NULL, 'opusoperations@olympusme.com', 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614'),
        ('SURESH JOGDANKAR-MSC', NULL, 'SURESH JOGDANKAR-MSC', '97028 43756', NULL, 'GHATKOPAR', 'mumbai', 'Maharashtra', '27', '400086'),
        ('MSC', NULL, 'MSC', '+91 2266378000', 'ind-info@msc.com', 'SANDESH SIR  ANDHERI', 'mumbai', 'Maharashtra', '27', NULL),
        ('Sea Power Marine Services LLC', NULL, 'SEA POWER  (DUBAI )', '+971 56 956 0696', 'mail@seapowerms.com', 'Suites M-07 & GR-17, Al Habtoor Khabaisi Complex, Off. Intl. Airport, P.O. Box:- 16144, Dubai, UAE', 'dubai', NULL, NULL, NULL),
        ('Van Oord India Private Limited', '27AAACH5430J1ZO', 'SANJEEV WARAD-VAN OORD (mumbai )', 'T+91 22 69017900 extn 107 M+91 9930372826', 'Sanjeev.Warad@vanoord.com shilpa.Mangeshkar@vanoord.com', '201, 2nd Floor, Central Plaza 166,C S T Road, Kalina, Mumbai – 400 098, India', 'mumbai', 'Maharashtra', '27', '400098'),
        ('SAGAR ABAN', NULL, 'SAGAR ABAN', '86522 01978', 'sagar_nikalje@yahoo.com', 'BELAPUR', 'navi mumbai', 'Maharashtra', '27', '400614');
        """

        cursor.execute(insert_query)
        conn.commit()

        print("✅ Inserted actual B2B customer data")

        # Check final count
        cursor.execute('SELECT COUNT(*) FROM b2bcustomersdetails')
        count = cursor.fetchone()[0]
        print(f'Total B2B customers in database: {count}')

        # Show sample records
        cursor.execute('SELECT company_name, contact_person FROM b2bcustomersdetails LIMIT 10')
        rows = cursor.fetchall()
        print('\nSample records:')
        for i, row in enumerate(rows, 1):
            print(f'{i}. {row[0]} ({row[1]})')

    except Exception as e:
        print(f"❌ Error updating B2B data: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    update_b2b_customers()