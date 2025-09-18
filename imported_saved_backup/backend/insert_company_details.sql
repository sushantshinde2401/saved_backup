-- Script to insert company details data into PostgreSQL
-- This script inserts the provided company data

-- Insert company details data
INSERT INTO company_details (
    company_name,
    company_address,
    company_gst_number,
    bank_name,
    account_number,
    branch,
    ifsc_code,
    swift_code
) VALUES
(
    'ANGEL SEAFARER DOCUMENTATION PRIVATE LIMITED',
    'SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614',
    '27AAYCA0004D1Z0',
    'IDFC FIRST BANK',
    '101-2103-4948',
    'Belapur',
    'IDFB0040172',
    'IDFB IN BB MUM'
),
(
    'ANGEL MARITIME ACADEMY PRIVATE LIMITED',
    'SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614',
    '27AAZCA2020J1ZI',
    'IDFC FIRST BANK',
    '101-4881-6551',
    'Belapur',
    'IDFB0040172',
    NULL
),
(
    'Moreshwar Shipping Services',
    'SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614',
    NULL,
    'IDFC FIRST BANK',
    '10188909073',
    'APMC Vashi (Branch Code - 40193)',
    'IDFB0040193',
    NULL
),
(
    'BALLALESHWAR SHIPPING SERVICES',
    'SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614',
    NULL,
    'IDFC FIRST BANK',
    '10191830765',
    'Navi Mumbai-Vashi APMC Branch',
    'IDFB 0040193',
    NULL
),
(
    'SIDDHIVINAYAK MARINE CONSULTANCY',
    'SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614',
    NULL,
    'IDFC FIRST BANK',
    '83699905961',
    'VASHI -APMC BRANCH',
    'IDFB0040193',
    NULL
)
ON CONFLICT (account_number) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    company_address = EXCLUDED.company_address,
    company_gst_number = EXCLUDED.company_gst_number,
    bank_name = EXCLUDED.bank_name,
    branch = EXCLUDED.branch,
    ifsc_code = EXCLUDED.ifsc_code,
    swift_code = EXCLUDED.swift_code,
    updated_at = CURRENT_TIMESTAMP;

-- Display success message
DO $$
DECLARE
    inserted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inserted_count FROM company_details;
    RAISE NOTICE 'Company details data inserted/updated successfully';
    RAISE NOTICE 'Total records in company_details table: %', inserted_count;
END $$;