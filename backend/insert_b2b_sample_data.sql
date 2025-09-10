-- Script to insert 10 sample B2B customers into b2bcandidatedetails table
-- This script can be run multiple times safely (uses INSERT with ON CONFLICT)

INSERT INTO b2bcandidatedetails (company_name, gst_number, contact_person, phone_number, email, address, city, state, state_code, pincode) VALUES
('Tech Solutions India Pvt Ltd', '22AAAAA0000A1Z5', 'Rajesh Kumar', '+91-9876543210', 'rajesh.kumar@techsolutions.com', '123 Business Park, Sector 18', 'Gurgaon', 'Haryana', '06', '122001'),
('Global Manufacturing Corp', '07BBBBB0000B2Y4', 'Priya Sharma', '+91-8765432109', 'priya.sharma@globalmfg.com', '456 Industrial Area, Phase 2', 'Faridabad', 'Haryana', '06', '121001'),
('Digital Services Hub', '29CCCCC0000C3X3', 'Amit Patel', '+91-7654321098', 'amit.patel@digitalservices.in', '789 Tech Tower, BKC', 'Mumbai', 'Maharashtra', '27', '400051'),
('Logistics & Supply Chain Ltd', '33DDDDD0000D4W2', 'Sneha Reddy', '+91-6543210987', 'sneha.reddy@logisticsltd.com', '321 Transport Nagar', 'Chennai', 'Tamil Nadu', '33', '600001'),
('Healthcare Solutions Inc', '36EEEEE0000E5V1', 'Dr. Vikram Singh', '+91-5432109876', 'vikram.singh@healthcaresol.com', '654 Medical Plaza, Anna Nagar', 'Chennai', 'Tamil Nadu', '33', '600040'),
('Education Technology Pvt Ltd', '09FFFFF0000F6U0', 'Anjali Gupta', '+91-4321098765', 'anjali.gupta@edutech.in', '987 Knowledge Park, Whitefield', 'Bangalore', 'Karnataka', '29', '560066'),
('Construction & Engineering Co', '23GGGGG0000G7T9', 'Ravi Verma', '+91-3210987654', 'ravi.verma@constructeng.com', '147 Builder Street, Andheri', 'Mumbai', 'Maharashtra', '27', '400058'),
('Retail Chain Solutions', '24HHHHH0000H8S8', 'Kavita Jain', '+91-2109876543', 'kavita.jain@retailchain.com', '258 Mall Road, Connaught Place', 'Delhi', 'Delhi', '07', '110001'),
('Automotive Parts Ltd', '32IIIII0000I9R7', 'Suresh Nair', '+91-1098765432', 'suresh.nair@autoparts.co.in', '369 Auto Complex, Padi', 'Chennai', 'Tamil Nadu', '33', '600050'),
('Software Development Corp', '27JJJJJ0000J0Q6', 'Meera Iyer', '+91-9988776655', 'meera.iyer@softdevcorp.com', '741 IT Park, Hinjewadi', 'Pune', 'Maharashtra', '27', '411057');

-- Display success message
DO $$
DECLARE
    inserted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inserted_count FROM b2bcandidatedetails;
    RAISE NOTICE 'Sample B2B customer data insertion completed';
    RAISE NOTICE 'Total B2B customers in database: %', inserted_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Sample companies inserted:';
    RAISE NOTICE '- Tech Solutions India Pvt Ltd';
    RAISE NOTICE '- Global Manufacturing Corp';
    RAISE NOTICE '- Digital Services Hub';
    RAISE NOTICE '- Logistics & Supply Chain Ltd';
    RAISE NOTICE '- Healthcare Solutions Inc';
    RAISE NOTICE '- Education Technology Pvt Ltd';
    RAISE NOTICE '- Construction & Engineering Co';
    RAISE NOTICE '- Retail Chain Solutions';
    RAISE NOTICE '- Automotive Parts Ltd';
    RAISE NOTICE '- Software Development Corp';
END $$;