from flask import Blueprint, request, jsonify
from database.db_connection import execute_query
import logging

logger = logging.getLogger(__name__)

bookkeeping_bp = Blueprint('bookkeeping', __name__)

@bookkeeping_bp.route('/get-all-companies', methods=['GET'])
def get_all_companies():
    """Get all companies for dropdown"""
    try:
        from shared.utils import get_all_company_accounts

        companies = get_all_company_accounts()

        if companies:
            logger.info(f"[COMPANIES] Retrieved {len(companies)} companies")
            return jsonify({
                "status": "success",
                "data": companies,
                "message": f"Retrieved {len(companies)} companies successfully",
                "total": len(companies)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No companies found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[COMPANIES] Failed to retrieve companies: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve companies",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-b2b-customers', methods=['GET'])
def get_b2b_customers():
    """Get all B2B customers for invoice generation"""
    try:
        query = """
            SELECT id, company_name, gst_number, contact_person, phone_number,
                    email, address, city, state, state_code, pincode
            FROM b2bcustomersdetails
            ORDER BY company_name ASC
        """

        results = execute_query(query)

        if results:
            customers = []
            for row in results:
                customers.append({
                    'id': row['id'],
                    'company_name': row['company_name'],
                    'gst_number': row['gst_number'],
                    'contact_person': row['contact_person'],
                    'phone_number': row['phone_number'],
                    'email': row['email'],
                    'address': row['address'],
                    'city': row['city'],
                    'state': row['state'],
                    'state_code': row['state_code'],
                    'pincode': row['pincode']
                })

            logger.info(f"[B2B] Retrieved {len(customers)} B2B customers")
            return jsonify({
                "status": "success",
                "data": customers,
                "message": f"Retrieved {len(customers)} B2B customers successfully",
                "total": len(customers)
            }), 200
        else:
            # Return mock data if database is not available or empty
            mock_customers = [
                {
                    'id': 1,
                    'company_name': 'Tech Solutions India Pvt Ltd',
                    'gst_number': '22AAAAA0000A1Z5',
                    'contact_person': 'Rajesh Kumar',
                    'phone_number': '+91-9876543210',
                    'email': 'rajesh.kumar@techsolutions.com',
                    'address': '123 Business Park, Sector 18',
                    'city': 'Gurgaon',
                    'state': 'Haryana',
                    'state_code': '06',
                    'pincode': '122001'
                },
                {
                    'id': 2,
                    'company_name': 'Global Manufacturing Corp',
                    'gst_number': '07BBBBB0000B2Y4',
                    'contact_person': 'Priya Sharma',
                    'phone_number': '+91-8765432109',
                    'email': 'priya.sharma@globalmfg.com',
                    'address': '456 Industrial Area, Phase 2',
                    'city': 'Faridabad',
                    'state': 'Haryana',
                    'state_code': '06',
                    'pincode': '121001'
                },
                {
                    'id': 3,
                    'company_name': 'Digital Services Hub',
                    'gst_number': '29CCCCC0000C3X3',
                    'contact_person': 'Amit Patel',
                    'phone_number': '+91-7654321098',
                    'email': 'amit.patel@digitalservices.in',
                    'address': '789 Tech Tower, BKC',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'state_code': '27',
                    'pincode': '400051'
                },
                {
                    'id': 4,
                    'company_name': 'Logistics & Supply Chain Ltd',
                    'gst_number': '33DDDDD0000D4W2',
                    'contact_person': 'Sneha Reddy',
                    'phone_number': '+91-6543210987',
                    'email': 'sneha.reddy@logisticsltd.com',
                    'address': '321 Transport Nagar',
                    'city': 'Chennai',
                    'state': 'Tamil Nadu',
                    'state_code': '33',
                    'pincode': '600001'
                },
                {
                    'id': 5,
                    'company_name': 'Healthcare Solutions Inc',
                    'gst_number': '36EEEEE0000E5V1',
                    'contact_person': 'Dr. Vikram Singh',
                    'phone_number': '+91-5432109876',
                    'email': 'vikram.singh@healthcaresol.com',
                    'address': '654 Medical Plaza, Anna Nagar',
                    'city': 'Chennai',
                    'state': 'Tamil Nadu',
                    'state_code': '33',
                    'pincode': '600040'
                }
            ]
            print("[MOCK] Database not available, returning mock B2B customers")
            return jsonify({
                "status": "success",
                "data": mock_customers,
                "message": f"Retrieved {len(mock_customers)} B2B customers successfully (mock data)",
                "total": len(mock_customers)
            }), 200

    except Exception as e:
        # Return mock data if database connection fails
        mock_customers = [
            {
                'id': 1,
                'company_name': 'Tech Solutions India Pvt Ltd',
                'gst_number': '22AAAAA0000A1Z5',
                'contact_person': 'Rajesh Kumar',
                'phone_number': '+91-9876543210',
                'email': 'rajesh.kumar@techsolutions.com',
                'address': '123 Business Park, Sector 18',
                'city': 'Gurgaon',
                'state': 'Haryana',
                'state_code': '06',
                'pincode': '122001'
            },
            {
                'id': 2,
                'company_name': 'Global Manufacturing Corp',
                'gst_number': '07BBBBB0000B2Y4',
                'contact_person': 'Priya Sharma',
                'phone_number': '+91-8765432109',
                'email': 'priya.sharma@globalmfg.com',
                'address': '456 Industrial Area, Phase 2',
                'city': 'Faridabad',
                'state': 'Haryana',
                'state_code': '06',
                'pincode': '121001'
            },
            {
                'id': 3,
                'company_name': 'Digital Services Hub',
                'gst_number': '29CCCCC0000C3X3',
                'contact_person': 'Amit Patel',
                'phone_number': '+91-7654321098',
                'email': 'amit.patel@digitalservices.in',
                'address': '789 Tech Tower, BKC',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'state_code': '27',
                'pincode': '400051'
            },
            {
                'id': 4,
                'company_name': 'Logistics & Supply Chain Ltd',
                'gst_number': '33DDDDD0000D4W2',
                'contact_person': 'Sneha Reddy',
                'phone_number': '+91-6543210987',
                'email': 'sneha.reddy@logisticsltd.com',
                'address': '321 Transport Nagar',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'state_code': '33',
                'pincode': '600001'
            },
            {
                'id': 5,
                'company_name': 'Healthcare Solutions Inc',
                'gst_number': '36EEEEE0000E5V1',
                'contact_person': 'Dr. Vikram Singh',
                'phone_number': '+91-5432109876',
                'email': 'vikram.singh@healthcaresol.com',
                'address': '654 Medical Plaza, Anna Nagar',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'state_code': '33',
                'pincode': '600040'
            }
        ]
        print("[MOCK] Database connection failed, returning mock B2B customers")
        return jsonify({
            "status": "success",
            "data": mock_customers,
            "message": f"Retrieved {len(mock_customers)} B2B customers successfully (mock data)",
            "total": len(mock_customers)
        }), 200

@bookkeeping_bp.route('/get-all-vendors', methods=['GET'])
def get_all_vendors():
    """Get all vendors for dropdown"""
    try:
        from shared.utils import get_all_vendors

        vendors = get_all_vendors()

        if vendors:
            logger.info(f"[VENDORS] Retrieved {len(vendors)} vendors")
            return jsonify({
                "status": "success",
                "data": vendors,
                "message": f"Retrieved {len(vendors)} vendors successfully",
                "total": len(vendors)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No vendors found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[VENDORS] Failed to retrieve vendors: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendors",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-customer-details', methods=['GET'])
def get_customer_details():
    """Get customer details by name for auto-filling form"""
    customer_name = request.args.get('name', '').strip()

    if not customer_name:
        return jsonify({
            "error": "Customer name is required",
            "message": "Please provide a customer name parameter",
            "status": "validation_error"
        }), 400

    try:
        query = """
            SELECT id, company_name, gst_number, contact_person, phone_number,
                    email, address, city, state, state_code, pincode
            FROM b2bcustomersdetails
            WHERE company_name ILIKE %s
            LIMIT 1
        """

        results = execute_query(query, (f"%{customer_name}%",))

        if results and len(results) > 0:
            customer = results[0]
            customer_data = {
                'id': customer['id'],
                'company_name': customer['company_name'],
                'gst_number': customer['gst_number'],
                'contact_person': customer['contact_person'],
                'phone_number': customer['phone_number'],
                'email': customer['email'],
                'address': customer['address'],
                'city': customer['city'],
                'state': customer['state'],
                'state_code': customer['state_code'],
                'pincode': customer['pincode']
            }

            logger.info(f"[CUSTOMER] Retrieved customer details for: {customer_name}")
            return jsonify({
                "status": "success",
                "data": customer_data,
                "message": f"Retrieved customer details for: {customer_name}"
            }), 200
        else:
            # Return mock data if customer not found in database
            mock_customers = {
                "Retail Chain Solutions": {
                    'company_name': 'Retail Chain Solutions',
                    'gst_number': '22AAAAA0000A1Z5',
                    'contact_person': 'John Doe',
                    'phone_number': '+91-9876543210',
                    'email': 'john@retailchain.com',
                    'address': '123 Retail Street, Shopping Mall',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'state_code': '27',
                    'pincode': '400001'
                },
                "Automotive Parts Ltd": {
                    'company_name': 'Automotive Parts Ltd',
                    'gst_number': '07BBBBB0000B2Y4',
                    'contact_person': 'Jane Smith',
                    'phone_number': '+91-8765432109',
                    'email': 'jane@autoparts.com',
                    'address': '456 Auto Zone, Industrial Area',
                    'city': 'Pune',
                    'state': 'Maharashtra',
                    'state_code': '27',
                    'pincode': '411001'
                }
            }

            if customer_name in mock_customers:
                print(f"[MOCK] Database not available, returning mock customer: {customer_name}")
                return jsonify({
                    "status": "success",
                    "data": mock_customers[customer_name],
                    "message": f"Retrieved customer details for: {customer_name} (mock data)"
                }), 200
            else:
                return jsonify({
                    "error": "Customer not found",
                    "message": f"No customer found with name: {customer_name}",
                    "status": "not_found"
                }), 404

    except Exception as e:
        # Return mock data if database connection fails
        mock_customers = {
            "Retail Chain Solutions": {
                'company_name': 'Retail Chain Solutions',
                'gst_number': '22AAAAA0000A1Z5',
                'contact_person': 'John Doe',
                'phone_number': '+91-9876543210',
                'email': 'john@retailchain.com',
                'address': '123 Retail Street, Shopping Mall',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'state_code': '27',
                'pincode': '400001'
            },
            "Automotive Parts Ltd": {
                'company_name': 'Automotive Parts Ltd',
                'gst_number': '07BBBBB0000B2Y4',
                'contact_person': 'Jane Smith',
                'phone_number': '+91-8765432109',
                'email': 'jane@autoparts.com',
                'address': '456 Auto Zone, Industrial Area',
                'city': 'Pune',
                'state': 'Maharashtra',
                'state_code': '27',
                'pincode': '411001'
            }
        }

        if customer_name in mock_customers:
            print(f"[MOCK] Database connection failed, returning mock customer: {customer_name}")
            return jsonify({
                "status": "success",
                "data": mock_customers[customer_name],
                "message": f"Retrieved customer details for: {customer_name} (mock data)"
            }), 200
        else:
            return jsonify({
                "error": "Customer not found",
                "message": f"No customer found with name: {customer_name}",
                "status": "not_found"
            }), 404

@bookkeeping_bp.route('/get-b2b-customer/<int:customer_id>', methods=['GET'])
def get_b2b_customer(customer_id):
    """Get a specific B2B customer by ID for auto-filling form"""
    try:
        query = """
            SELECT id, company_name, gst_number, contact_person, phone_number,
                    email, address, city, state, state_code, pincode
            FROM b2bcustomersdetails
            WHERE id = %s
        """

        results = execute_query(query, (customer_id,))

        if results and len(results) > 0:
            customer = results[0]
            customer_data = {
                'id': customer['id'],
                'company_name': customer['company_name'],
                'gst_number': customer['gst_number'],
                'contact_person': customer['contact_person'],
                'phone_number': customer['phone_number'],
                'email': customer['email'],
                'address': customer['address'],
                'city': customer['city'],
                'state': customer['state'],
                'state_code': customer['state_code'],
                'pincode': customer['pincode']
            }

            logger.info(f"[B2B] Retrieved B2B customer: {customer['company_name']}")
            return jsonify({
                "status": "success",
                "data": customer_data,
                "message": f"Retrieved B2B customer: {customer['company_name']}"
            }), 200
        else:
            # Return mock data if customer not found in database
            mock_customers = {
                1: {
                    'id': 1,
                    'company_name': 'Tech Solutions India Pvt Ltd',
                    'gst_number': '22AAAAA0000A1Z5',
                    'contact_person': 'Rajesh Kumar',
                    'phone_number': '+91-9876543210',
                    'email': 'rajesh.kumar@techsolutions.com',
                    'address': '123 Business Park, Sector 18',
                    'city': 'Gurgaon',
                    'state': 'Haryana',
                    'state_code': '06',
                    'pincode': '122001'
                },
                2: {
                    'id': 2,
                    'company_name': 'Global Manufacturing Corp',
                    'gst_number': '07BBBBB0000B2Y4',
                    'contact_person': 'Priya Sharma',
                    'phone_number': '+91-8765432109',
                    'email': 'priya.sharma@globalmfg.com',
                    'address': '456 Industrial Area, Phase 2',
                    'city': 'Faridabad',
                    'state': 'Haryana',
                    'state_code': '06',
                    'pincode': '121001'
                },
                3: {
                    'id': 3,
                    'company_name': 'Digital Services Hub',
                    'gst_number': '29CCCCC0000C3X3',
                    'contact_person': 'Amit Patel',
                    'phone_number': '+91-7654321098',
                    'email': 'amit.patel@digitalservices.in',
                    'address': '789 Tech Tower, BKC',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'state_code': '27',
                    'pincode': '400051'
                },
                4: {
                    'id': 4,
                    'company_name': 'Logistics & Supply Chain Ltd',
                    'gst_number': '33DDDDD0000D4W2',
                    'contact_person': 'Sneha Reddy',
                    'phone_number': '+91-6543210987',
                    'email': 'sneha.reddy@logisticsltd.com',
                    'address': '321 Transport Nagar',
                    'city': 'Chennai',
                    'state': 'Tamil Nadu',
                    'state_code': '33',
                    'pincode': '600001'
                },
                5: {
                    'id': 5,
                    'company_name': 'Healthcare Solutions Inc',
                    'gst_number': '36EEEEE0000E5V1',
                    'contact_person': 'Dr. Vikram Singh',
                    'phone_number': '+91-5432109876',
                    'email': 'vikram.singh@healthcaresol.com',
                    'address': '654 Medical Plaza, Anna Nagar',
                    'city': 'Chennai',
                    'state': 'Tamil Nadu',
                    'state_code': '33',
                    'pincode': '600040'
                }
            }

            if customer_id in mock_customers:
                print(f"[MOCK] Database not available, returning mock B2B customer ID: {customer_id}")
                return jsonify({
                    "status": "success",
                    "data": mock_customers[customer_id],
                    "message": f"Retrieved B2B customer: {mock_customers[customer_id]['company_name']} (mock data)"
                }), 200
            else:
                return jsonify({
                    "error": "B2B customer not found",
                    "message": f"No B2B customer found with ID: {customer_id}",
                    "status": "not_found"
                }), 404

    except Exception as e:
        # Return mock data if database connection fails
        mock_customers = {
            1: {
                'id': 1,
                'company_name': 'Tech Solutions India Pvt Ltd',
                'gst_number': '22AAAAA0000A1Z5',
                'contact_person': 'Rajesh Kumar',
                'phone_number': '+91-9876543210',
                'email': 'rajesh.kumar@techsolutions.com',
                'address': '123 Business Park, Sector 18',
                'city': 'Gurgaon',
                'state': 'Haryana',
                'state_code': '06',
                'pincode': '122001'
            },
            2: {
                'id': 2,
                'company_name': 'Global Manufacturing Corp',
                'gst_number': '07BBBBB0000B2Y4',
                'contact_person': 'Priya Sharma',
                'phone_number': '+91-8765432109',
                'email': 'priya.sharma@globalmfg.com',
                'address': '456 Industrial Area, Phase 2',
                'city': 'Faridabad',
                'state': 'Haryana',
                'state_code': '06',
                'pincode': '121001'
            },
            3: {
                'id': 3,
                'company_name': 'Digital Services Hub',
                'gst_number': '29CCCCC0000C3X3',
                'contact_person': 'Amit Patel',
                'phone_number': '+91-7654321098',
                'email': 'amit.patel@digitalservices.in',
                'address': '789 Tech Tower, BKC',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'state_code': '27',
                'pincode': '400051'
            },
            4: {
                'id': 4,
                'company_name': 'Logistics & Supply Chain Ltd',
                'gst_number': '33DDDDD0000D4W2',
                'contact_person': 'Sneha Reddy',
                'phone_number': '+91-6543210987',
                'email': 'sneha.reddy@logisticsltd.com',
                'address': '321 Transport Nagar',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'state_code': '33',
                'pincode': '600001'
            },
            5: {
                'id': 5,
                'company_name': 'Healthcare Solutions Inc',
                'gst_number': '36EEEEE0000E5V1',
                'contact_person': 'Dr. Vikram Singh',
                'phone_number': '+91-5432109876',
                'email': 'vikram.singh@healthcaresol.com',
                'address': '654 Medical Plaza, Anna Nagar',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'state_code': '33',
                'pincode': '600040'
            }
        }

        if customer_id in mock_customers:
            print(f"[MOCK] Database connection failed, returning mock B2B customer ID: {customer_id}")
            return jsonify({
                "status": "success",
                "data": mock_customers[customer_id],
                "message": f"Retrieved B2B customer: {mock_customers[customer_id]['company_name']} (mock data)"
            }), 200
        else:
            return jsonify({
                "error": "B2B customer not found",
                "message": f"No B2B customer found with ID: {customer_id}",
                "status": "not_found"
            }), 404

@bookkeeping_bp.route('/get-company-accounts', methods=['GET'])
def get_company_accounts():
    """Get all company accounts from database"""
    try:
        from shared.utils import get_all_company_accounts

        accounts = get_all_company_accounts()

        if accounts:
            logger.info(f"[COMPANY] Retrieved {len(accounts)} company accounts")
            return jsonify({
                "status": "success",
                "data": accounts,
                "message": f"Retrieved {len(accounts)} company accounts successfully",
                "total": len(accounts)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No company accounts found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[COMPANY] Failed to retrieve company accounts: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve company accounts",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-company-details/<account_number>', methods=['GET'])
def get_company_details(account_number):
    """Get company details by account number"""
    try:
        from shared.utils import get_company_details_by_account

        details = get_company_details_by_account(account_number)

        if details:
            logger.info(f"[COMPANY] Retrieved company details for account: {account_number}")
            return jsonify({
                "status": "success",
                "data": details,
                "message": f"Retrieved company details for account: {account_number}"
            }), 200
        else:
            return jsonify({
                "error": "Company not found",
                "message": f"No company found for account number: {account_number}",
                "status": "not_found"
            }), 404

    except Exception as e:
        logger.error(f"[COMPANY] Failed to retrieve company details for {account_number}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve company details",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/company-details/<int:company_id>', methods=['DELETE'])
def delete_company_details(company_id):
    """Delete a company details record by ID"""
    try:
        # Check if the record exists
        check_query = "SELECT id, company_name FROM company_details WHERE id = %s"
        check_result = execute_query(check_query, (company_id,))

        if not check_result or len(check_result) == 0:
            return jsonify({
                "error": "Company not found",
                "message": f"No company found with ID: {company_id}",
                "status": "not_found"
            }), 404

        company_name = check_result[0]['company_name']

        # Delete the record
        delete_query = "DELETE FROM company_details WHERE id = %s"
        execute_query(delete_query, (company_id,), fetch=False)

        logger.info(f"[COMPANY] Deleted company details record ID: {company_id}, Company: {company_name}")
        return jsonify({
            "status": "success",
            "message": f"Company details record ID {company_id} ({company_name}) deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"[COMPANY] Failed to delete company details ID {company_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete company details record",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/upload-to-ledger', methods=['POST'])
def upload_to_ledger():
    """Upload data to company ledger"""
    try:
        data = request.get_json()

        required_fields = ['company_name', 'date', 'particulars', 'voucher_no', 'debit', 'credit']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Ensure CompanyLedger table exists
        create_table_query = """
            CREATE TABLE IF NOT EXISTS CompanyLedger (
                id SERIAL PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                particulars TEXT,
                voucher_no VARCHAR(100),
                voucher_type VARCHAR(50) DEFAULT 'Receipt',
                debit DECIMAL(15,2) DEFAULT 0,
                credit DECIMAL(15,2) DEFAULT 0,
                candidate_name VARCHAR(255),
                entry_type VARCHAR(50) DEFAULT 'Manual',
                reference_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_table_query, fetch=False)

        # Create indexes if they don't exist
        index_queries = [
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_company_name ON CompanyLedger(company_name)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_date ON CompanyLedger(date)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_voucher_no ON CompanyLedger(voucher_no)"
        ]
        for index_query in index_queries:
            try:
                execute_query(index_query, fetch=False)
            except Exception as idx_e:
                logger.warning(f"[LEDGER] Could not create index: {idx_e}")

        # Insert into CompanyLedger table
        query = """
            INSERT INTO CompanyLedger (
                company_name, date, particulars, voucher_no, voucher_type,
                debit, credit, entry_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        params = (
            data['company_name'],
            data['date'],
            data['particulars'],
            data['voucher_no'],
            data.get('voucher_type', 'Sales'),
            data['debit'],
            data['credit'],
            data.get('entry_type', 'Manual')
        )

        result = execute_query(query, params)

        if result:
            ledger_id = result[0]['id']
            logger.info(f"[LEDGER] Created ledger entry ID: {ledger_id} for company: {data['company_name']}")

            # If voucher_type is 'receipt', also save to bank_ledger table
            if data.get('voucher_type', '').lower() == 'receipt':
                try:
                    # Get company_id for bank ledger insertion
                    company_id = None
                    if data.get('company_name'):
                        company_query = "SELECT id FROM company_details WHERE company_name = %s LIMIT 1"
                        company_result = execute_query(company_query, (data['company_name'],))
                        if company_result:
                            company_id = company_result[0]['id']

                    if company_id:
                        bank_ledger_query = """
                            INSERT INTO bank_ledger (
                                payment_date, transaction_id, vendor_id, company_id, vendor_name,
                                amount, remark, transaction_type
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """

                        # Generate transaction_id if not provided
                        transaction_id = f"LEDGER-{ledger_id}"

                        # For receipt entries, credit amount represents money received
                        amount = data.get('credit', 0)

                        bank_remark = f"Receipt entry from ledger - {data.get('particulars', '')}"

                        execute_query(bank_ledger_query, (
                            data['date'],  # payment_date
                            transaction_id,  # transaction_id
                            None,  # vendor_id (not applicable for receipts)
                            company_id,  # company_id
                            data['company_name'],  # vendor_name (customer/company receiving)
                            amount,  # amount
                            bank_remark,  # remark
                            'receipt'  # transaction_type
                        ), fetch=False)

                        logger.info(f"[BANK_LEDGER] Auto-inserted bank ledger entry for receipt ledger ID: {ledger_id}, transaction: {transaction_id}")
                    else:
                        logger.warning(f"[BANK_LEDGER] No company_id found for company '{data.get('company_name')}', skipping bank ledger insertion for receipt entry")

                except Exception as bank_e:
                    logger.error(f"[BANK_LEDGER] Failed to auto-insert bank ledger entry for receipt ledger ID {ledger_id}: {bank_e}")
                    # Don't fail the ledger creation if bank ledger insertion fails

            return jsonify({
                "status": "success",
                "data": {"ledger_id": ledger_id},
                "message": f"Ledger entry created successfully with ID: {ledger_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create entry",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[LEDGER] Failed to upload to ledger: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to upload data to ledger",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-customers', methods=['GET'])
def get_customers():
    """Get all customers (existing endpoint)"""
    try:
        # This would typically come from a customers table
        # For now, returning sample data
        sample_customers = [
            {'id': 1, 'name': 'John Doe'},
            {'id': 2, 'name': 'Jane Smith'},
            {'id': 3, 'name': 'Bob Johnson'},
            {'id': 4, 'name': 'Alice Brown'}
        ]

        logger.info(f"[CUSTOMERS] Retrieved {len(sample_customers)} customers")
        return jsonify({
            "status": "success",
            "data": sample_customers,
            "message": f"Retrieved {len(sample_customers)} customers successfully",
            "total": len(sample_customers)
        }), 200

    except Exception as e:
        logger.error(f"[CUSTOMERS] Failed to retrieve customers: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve customers",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/receipt-invoice-data', methods=['POST'])
def create_receipt_invoice_data():
    """Create a new receipt invoice data record"""
    try:
        data = request.get_json()

        required_fields = ['invoice_no', 'candidate_id', 'company_name', 'company_account_number']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Use the existing database function
        from database.db_connection import insert_receipt_invoice_data
        result = insert_receipt_invoice_data(data)

        return jsonify({
            "status": "success",
            "data": {"invoice_no": result},
            "message": f"Receipt invoice data created successfully with invoice: {result}"
        }), 201

    except Exception as e:
        logger.error(f"[RECEIPT_INVOICE] Failed to create receipt invoice data: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create receipt invoice data record",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/receipt-amount-received', methods=['POST'])
def create_receipt_amount_received():
    """Create a new receipt amount received record"""
    try:
        data = request.get_json()

        required_fields = ['amount_received', 'payment_type', 'transaction_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        query = """
            INSERT INTO ReceiptAmountReceived (
                amount_received, payment_type, transaction_date,
                remark, account_no, company_name,
                tds_amount, gst_amount, customer_name, transaction_id, on_account_of
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING receipt_amount_id
        """

        result = execute_query(query, (
            data['amount_received'],
            data['payment_type'],
            data['transaction_date'],
            data.get('remark'),
            data.get('account_no'),
            data.get('company_name'),
            data.get('tds_percentage', 0),  # This maps to tds_amount
            data.get('gst', 0),  # This maps to gst_amount
            data.get('customer_name'),
            data.get('transaction_id'),
            data.get('on_account_of')
        ))

        if result:
            receipt_id = result[0]['receipt_amount_id']
            logger.info(f"[RECEIPT] Created receipt amount received record ID: {receipt_id}")

            # After creating receipt, insert into CompanyLedger and Bank Ledger
            try:
                # Retrieve the receipt data we just inserted
                receipt_query = """
                    SELECT customer_name, transaction_date, account_no, amount_received, company_name, transaction_id
                    FROM ReceiptAmountReceived
                    WHERE receipt_amount_id = %s
                """
                receipt_result = execute_query(receipt_query, (receipt_id,))

                if receipt_result and len(receipt_result) > 0:
                    receipt_data = receipt_result[0]
                    customer_name = receipt_data['customer_name']
                    transaction_date = receipt_data['transaction_date']
                    account_no = receipt_data['account_no']
                    amount_received = receipt_data['amount_received']
                    company_name = receipt_data['company_name']
                    transaction_id = receipt_data['transaction_id']

                    # Get company_id for bank ledger insertion
                    company_id = None
                    if company_name:
                        company_query = "SELECT id FROM company_details WHERE company_name = %s LIMIT 1"
                        company_result = execute_query(company_query, (company_name,))
                        if company_result:
                            company_id = company_result[0]['id']

                    if customer_name:
                        # Insert into CompanyLedger (Client Ledger)
                        ledger_query = """
                            INSERT INTO CompanyLedger (
                                company_name, date, particulars, voucher_no, voucher_type,
                                debit, credit, entry_type
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """

                        particulars = f"Account No: {account_no}" if account_no else "Account No: N/A"
                        voucher_no = f"RCPT-{receipt_id}"  # Generate voucher number

                        execute_query(ledger_query, (
                            customer_name,  # company_name in ledger is the customer_name from receipt
                            transaction_date,
                            particulars,
                            voucher_no,
                            'Receipt',
                            0,  # debit
                            amount_received,  # credit
                            'Auto'
                        ), fetch=False)

                        logger.info(f"[LEDGER] Auto-inserted client ledger entry for receipt ID: {receipt_id}, company: {customer_name}")

                        # Insert into Bank Ledger table
                        if company_id:
                            bank_ledger_query = """
                                INSERT INTO bank_ledger (
                                    payment_date, transaction_id, vendor_id, company_id, vendor_name,
                                    amount, remark, transaction_type
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """
    
                            bank_remark = f"Receipt from {customer_name} - {transaction_id or ''}"
    
                            execute_query(bank_ledger_query, (
                                transaction_date,  # payment_date
                                transaction_id,  # transaction_id
                                None,  # vendor_id (not applicable for receipts)
                                company_id,  # company_id
                                customer_name,  # vendor_name (customer paying)
                                amount_received,  # amount
                                bank_remark,  # remark
                                'receipt'  # transaction_type
                            ), fetch=False)

                            logger.info(f"[BANK_LEDGER] Auto-inserted bank ledger entry for receipt ID: {receipt_id}, transaction: {transaction_id}")
                        else:
                            logger.warning(f"[BANK_LEDGER] No company_id found for company '{company_name}', skipping bank ledger insertion")

                    else:
                        logger.warning(f"[LEDGER] No customer_name found for receipt ID: {receipt_id}, skipping ledger insertions")

                else:
                    logger.error(f"[LEDGER] Could not retrieve receipt data for ID: {receipt_id}")

            except Exception as ledger_e:
                logger.error(f"[LEDGER] Failed to auto-insert ledger entries for receipt ID {receipt_id}: {ledger_e}")
                # Don't fail the receipt creation if ledger insertion fails

            return jsonify({
                "status": "success",
                "data": {"receipt_amount_id": receipt_id},
                "message": f"Receipt amount received record created successfully with ID: {receipt_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create record",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[RECEIPT] Failed to create receipt amount received: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create receipt amount received record",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/receipt-amount-received', methods=['GET'])
def get_receipt_amount_received():
    """Get receipt amount received records with optional filtering"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        query = """
            SELECT * FROM ReceiptAmountReceived
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        params = (limit, offset)

        results = execute_query(query, params)

        if results:
            receipts = []
            for row in results:
                receipts.append({
                    'receipt_amount_id': row['receipt_amount_id'],
                    'amount_received': float(row['amount_received']) if row['amount_received'] else 0,
                    'payment_type': row['payment_type'],
                    'transaction_date': str(row['transaction_date']) if row['transaction_date'] else None,
                    'remark': row['remark'],
                    'account_no': row['account_no'],
                    'company_name': row['company_name'],
                    'tds_percentage': float(row['tds_amount']) if row['tds_amount'] else 0,
                    'gst': float(row['gst_amount']) if row['gst_amount'] else 0,
                    'customer_name': row['customer_name'],
                    'transaction_id': row['transaction_id'],
                    'on_account_of': row['on_account_of'],
                    'created_at': str(row['created_at'])
                })

            logger.info(f"[RECEIPT] Retrieved {len(receipts)} receipt amount received records")
            return jsonify({
                "status": "success",
                "data": receipts,
                "message": f"Retrieved {len(receipts)} receipt amount received records successfully",
                "total": len(receipts)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No receipt amount received records found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[RECEIPT] Failed to retrieve receipt amount received: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve receipt amount received records",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/receipt-amount-received/<int:receipt_id>', methods=['GET'])
def get_receipt_amount_received_by_id(receipt_id):
    """Get a specific receipt amount received record by ID"""
    try:
        query = "SELECT * FROM ReceiptAmountReceived WHERE receipt_amount_id = %s"
        results = execute_query(query, (receipt_id,))

        if results and len(results) > 0:
            receipt = results[0]
            receipt_data = {
                'receipt_amount_id': receipt['receipt_amount_id'],
                'amount_received': float(receipt['amount_received']) if receipt['amount_received'] else 0,
                'payment_type': receipt['payment_type'],
                'transaction_date': str(receipt['transaction_date']) if receipt['transaction_date'] else None,
                'remark': receipt['remark'],
                'account_no': receipt['account_no'],
                'company_name': receipt['company_name'],
                'tds_percentage': float(receipt['tds_amount']) if receipt['tds_amount'] else 0,
                'gst': float(receipt['gst_amount']) if receipt['gst_amount'] else 0,
                'customer_name': receipt['customer_name'],
                'transaction_id': receipt['transaction_id'],
                'on_account_of': receipt['on_account_of'],
                'created_at': str(receipt['created_at'])
            }

            logger.info(f"[RECEIPT] Retrieved receipt amount received record ID: {receipt_id}")
            return jsonify({
                "status": "success",
                "data": receipt_data,
                "message": f"Retrieved receipt amount received record ID: {receipt_id}"
            }), 200
        else:
            return jsonify({
                "error": "Receipt not found",
                "message": f"No receipt amount received record found with ID: {receipt_id}"
            }), 404

    except Exception as e:
        logger.error(f"[RECEIPT] Failed to retrieve receipt amount received ID {receipt_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve receipt amount received record",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/receipt-amount-received/<int:receipt_id>', methods=['PUT'])
def update_receipt_amount_received(receipt_id):
    """Update a receipt amount received record"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided",
                "message": "Request body is required",
                "status": "validation_error"
            }), 400

        # Build dynamic update query
        update_fields = []
        params = []

        allowed_fields = ['amount_received', 'payment_type', 'transaction_date', 'remark', 'account_no', 'company_name', 'tds_percentage', 'gst', 'customer_name', 'transaction_id', 'on_account_of']
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])

        if not update_fields:
            return jsonify({
                "error": "No valid fields to update",
                "message": "At least one valid field must be provided",
                "status": "validation_error"
            }), 400

        update_clause = ", ".join(update_fields)
        query = f"""
            UPDATE ReceiptAmountReceived
            SET {update_clause}
            WHERE receipt_amount_id = %s
        """
        params.append(receipt_id)

        execute_query(query, params, fetch=False)

        logger.info(f"[RECEIPT] Updated receipt amount received record ID: {receipt_id}")
        return jsonify({
            "status": "success",
            "message": f"Receipt amount received record ID {receipt_id} updated successfully"
        }), 200

    except Exception as e:
        logger.error(f"[RECEIPT] Failed to update receipt amount received ID {receipt_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to update receipt amount received record",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/receipt-amount-received/<int:receipt_id>', methods=['DELETE'])
def delete_receipt_amount_received(receipt_id):
    """Delete a receipt amount received record and its corresponding ledger entries"""
    try:
        # First, get the receipt data to find transaction_id for bank ledger deletion
        receipt_query = "SELECT transaction_id FROM ReceiptAmountReceived WHERE receipt_amount_id = %s"
        receipt_result = execute_query(receipt_query, (receipt_id,))

        if not receipt_result or len(receipt_result) == 0:
            return jsonify({
                "error": "Receipt not found",
                "message": f"No receipt amount received record found with ID: {receipt_id}",
                "status": "not_found"
            }), 404

        transaction_id = receipt_result[0]['transaction_id']

        # Delete from bank_ledger if transaction_id exists
        if transaction_id:
            bank_ledger_delete_query = "DELETE FROM bank_ledger WHERE transaction_id = %s"
            execute_query(bank_ledger_delete_query, (transaction_id,), fetch=False)
            logger.info(f"[BANK_LEDGER] Deleted associated bank ledger entry for receipt ID: {receipt_id}, transaction: {transaction_id}")

        # Delete the corresponding client ledger entry
        voucher_no = f"RCPT-{receipt_id}"
        ledger_delete_query = "DELETE FROM CompanyLedger WHERE voucher_no = %s"
        execute_query(ledger_delete_query, (voucher_no,), fetch=False)
        logger.info(f"[LEDGER] Deleted associated client ledger entry for receipt ID: {receipt_id}")

        # Finally delete the receipt record
        query = "DELETE FROM ReceiptAmountReceived WHERE receipt_amount_id = %s"
        execute_query(query, (receipt_id,), fetch=False)

        logger.info(f"[RECEIPT] Deleted receipt amount received record ID: {receipt_id}")
        return jsonify({
            "status": "success",
            "message": f"Receipt amount received record ID {receipt_id} and associated ledger entries deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"[RECEIPT] Failed to delete receipt amount received ID {receipt_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete receipt amount received record",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/company-ledger', methods=['GET'])
def get_company_ledger():
    """Get company ledger data from CompanyLedger table with filtering and pagination"""
    try:
        # Get query parameters
        company_name = request.args.get('company_name', '').strip()
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        candidate_name = request.args.get('candidate_name', '').strip()
        voucher_type = request.args.get('voucher_type', '').strip()
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        if not company_name:
            return jsonify({
                "error": "Company name is required",
                "message": "Please provide a company_name parameter",
                "status": "validation_error"
            }), 400

        logger.info(f"[LEDGER] Fetching ledger data for company: {company_name}")

        # Ensure all required tables exist
        create_company_ledger_query = """
            CREATE TABLE IF NOT EXISTS CompanyLedger (
                id SERIAL PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                particulars TEXT,
                voucher_no VARCHAR(100),
                voucher_type VARCHAR(50) DEFAULT 'Receipt',
                debit DECIMAL(15,2) DEFAULT 0,
                credit DECIMAL(15,2) DEFAULT 0,
                candidate_name VARCHAR(255),
                entry_type VARCHAR(50) DEFAULT 'Manual',
                reference_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_company_ledger_query, fetch=False)

        # Ensure client_adjustments table exists
        create_client_adjustments_query = """
            CREATE TABLE IF NOT EXISTS client_adjustments (
                id SERIAL PRIMARY KEY,
                company_id INTEGER NOT NULL,
                customer_id INTEGER NOT NULL,
                date_of_service DATE NOT NULL,
                particular_of_service TEXT NOT NULL,
                adjustment_amount DECIMAL(15,2) NOT NULL CHECK (adjustment_amount != 0),
                on_account_of TEXT,
                remark TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES company_details(id),
                FOREIGN KEY (customer_id) REFERENCES b2bcustomersdetails(id)
            )
        """
        execute_query(create_client_adjustments_query, fetch=False)

        # Ensure vendor_adjustments table exists
        create_vendor_adjustments_query = """
            CREATE TABLE IF NOT EXISTS vendor_adjustments (
                id SERIAL PRIMARY KEY,
                company_id INTEGER NOT NULL,
                vendor_id INTEGER NOT NULL,
                date_of_service DATE NOT NULL,
                particular_of_service TEXT NOT NULL,
                adjustment_amount DECIMAL(15,2) NOT NULL CHECK (adjustment_amount != 0),
                on_account_of TEXT,
                remark TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES company_details(id),
                FOREIGN KEY (vendor_id) REFERENCES vendors(id)
            )
        """
        execute_query(create_vendor_adjustments_query, fetch=False)

        # Create indexes if they don't exist
        index_queries = [
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_company_name ON CompanyLedger(company_name)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_date ON CompanyLedger(date)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_voucher_no ON CompanyLedger(voucher_no)"
        ]
        for index_query in index_queries:
            try:
                execute_query(index_query, fetch=False)
            except Exception as idx_e:
                logger.warning(f"[LEDGER] Could not create index: {idx_e}")

        # Build UNION query for CompanyLedger and adjustment entries
        union_queries = []

        # CompanyLedger entries
        ledger_query = """
            SELECT
                id,
                company_name,
                date,
                particulars,
                voucher_no,
                voucher_type,
                debit,
                credit,
                entry_type,
                created_at,
                'ledger' as source_table
            FROM CompanyLedger
            WHERE company_name ILIKE %s
        """
        ledger_params = [f"%{company_name}%"]

        if start_date:
            ledger_query += " AND date >= %s"
            ledger_params.append(start_date)
        if end_date:
            ledger_query += " AND date <= %s"
            ledger_params.append(end_date)
        if candidate_name:
            ledger_query += " AND candidate_name ILIKE %s"
            ledger_params.append(f"%{candidate_name}%")
        if voucher_type:
            ledger_query += " AND voucher_type ILIKE %s"
            ledger_params.append(f"%{voucher_type}%")

        union_queries.append(ledger_query)

        # Client adjustments for this company
        client_adjustment_query = """
            SELECT
                ca.id,
                b2b.company_name,
                ca.date_of_service as date,
                ca.particular_of_service as particulars,
                CONCAT('ADJ-', ca.id) as voucher_no,
                'Adjustment' as voucher_type,
                CASE WHEN ca.adjustment_amount < 0 THEN ABS(ca.adjustment_amount) ELSE 0 END as debit,
                CASE WHEN ca.adjustment_amount > 0 THEN ca.adjustment_amount ELSE 0 END as credit,
                'Adjustment' as entry_type,
                ca.created_at,
                'client_adjustment' as source_table
            FROM client_adjustments ca
            JOIN b2bcustomersdetails b2b ON ca.customer_id = b2b.id
            WHERE b2b.company_name ILIKE %s
        """
        client_params = [f"%{company_name}%"]

        if start_date:
            client_adjustment_query += " AND ca.date_of_service >= %s"
            client_params.append(start_date)
        if end_date:
            client_adjustment_query += " AND ca.date_of_service <= %s"
            client_params.append(end_date)

        union_queries.append(client_adjustment_query)
        ledger_params.extend(client_params)

        # Vendor adjustments for this company
        vendor_adjustment_query = """
            SELECT
                va.id,
                cd.company_name,
                va.date_of_service as date,
                va.particular_of_service as particulars,
                CONCAT('ADJ-', va.id) as voucher_no,
                'Adjustment' as voucher_type,
                CASE WHEN va.adjustment_amount < 0 THEN ABS(va.adjustment_amount) ELSE 0 END as debit,
                CASE WHEN va.adjustment_amount > 0 THEN va.adjustment_amount ELSE 0 END as credit,
                'Adjustment' as entry_type,
                va.created_at,
                'vendor_adjustment' as source_table
            FROM vendor_adjustments va
            JOIN company_details cd ON va.company_id = cd.id
            WHERE cd.company_name ILIKE %s
        """
        vendor_params = [f"%{company_name}%"]

        if start_date:
            vendor_adjustment_query += " AND va.date_of_service >= %s"
            vendor_params.append(start_date)
        if end_date:
            vendor_adjustment_query += " AND va.date_of_service <= %s"
            vendor_params.append(end_date)

        union_queries.append(vendor_adjustment_query)
        ledger_params.extend(vendor_params)

        # Combine all queries
        full_query = " UNION ALL ".join(union_queries)
        full_query += " ORDER BY date DESC, created_at DESC"

        logger.info(f"[LEDGER] Executing combined query with params: {ledger_params}")

        ledger_results = execute_query(full_query, ledger_params)

        entries = []
        total_debit = 0
        total_credit = 0

        if ledger_results:
            logger.info(f"[LEDGER] Found {len(ledger_results)} entries in CompanyLedger")
            for row in ledger_results:
                debit_amount = float(row['debit']) if row['debit'] else 0
                credit_amount = float(row['credit']) if row['credit'] else 0
                entries.append({
                    'date': str(row['date']) if row['date'] else None,
                    'particulars': row['particulars'] or '',
                    'voucher_type': row['voucher_type'] or 'Sales',
                    'voucher_no': row['voucher_no'] or '',
                    'debit': debit_amount,
                    'credit': credit_amount,
                    'company_name': row['company_name'],
                    'entry_type': row['entry_type'] or 'Manual',
                    'id': row['id']
                })
                total_debit += debit_amount
                total_credit += credit_amount
        else:
            logger.info(f"[LEDGER] No entries found in CompanyLedger for company: {company_name}")

        # Sort entries by date descending
        entries.sort(key=lambda x: x['date'] or '1900-01-01', reverse=True)

        # Apply pagination
        paginated_entries = entries[offset:offset + limit]

        # Calculate summary
        opening_balance = 0  # Could be calculated from previous periods
        closing_balance = total_debit - total_credit
        balance_type = 'Outstanding' if closing_balance > 0 else 'Advance' if closing_balance < 0 else 'Settled'

        summary = {
            'opening_balance': opening_balance,
            'total_debit': total_debit,
            'total_credit': total_credit,
            'closing_balance': abs(closing_balance),
            'balance_type': balance_type
        }

        logger.info(f"[LEDGER] Returning {len(paginated_entries)} paginated entries for {company_name}")

        return jsonify({
            "status": "success",
            "data": {
                "entries": paginated_entries,
                "summary": summary,
                "total_entries": len(entries),
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + limit) < len(entries)
                }
            },
            "message": f"Retrieved {len(paginated_entries)} ledger entries for {company_name}",
            "total": len(paginated_entries)
        }), 200

    except Exception as e:
        logger.error(f"[LEDGER] Failed to retrieve company ledger for {company_name}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve company ledger data",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/company-ledger/<int:ledger_id>', methods=['DELETE'])
def delete_company_ledger_entry(ledger_id):
    """Delete a company ledger entry or adjustment entry based on the source table"""
    try:
        # First, check if this is a regular CompanyLedger entry
        select_query = """
            SELECT id, voucher_no, company_name, entry_type
            FROM CompanyLedger
            WHERE id = %s
        """
        ledger_results = execute_query(select_query, (ledger_id,))

        if ledger_results and len(ledger_results) > 0:
            # This is a regular CompanyLedger entry
            ledger_entry = ledger_results[0]
            voucher_no = ledger_entry['voucher_no']
            entry_type = ledger_entry['entry_type']

            # If this is an auto-generated receipt entry, also delete the receipt and bank ledger entries
            if voucher_no and voucher_no.startswith('RCPT-'):
                try:
                    # Extract receipt ID from voucher_no (format: RCPT-{receipt_id})
                    receipt_id_str = voucher_no.replace('RCPT-', '')
                    receipt_id = int(receipt_id_str)

                    # Get transaction_id from the receipt to delete bank ledger entry
                    receipt_query = "SELECT transaction_id FROM ReceiptAmountReceived WHERE receipt_amount_id = %s"
                    receipt_results = execute_query(receipt_query, (receipt_id,))

                    if receipt_results and len(receipt_results) > 0:
                        transaction_id = receipt_results[0]['transaction_id']

                        # Delete from bank_ledger if transaction_id exists
                        if transaction_id:
                            bank_ledger_delete_query = "DELETE FROM bank_ledger WHERE transaction_id = %s"
                            execute_query(bank_ledger_delete_query, (transaction_id,), fetch=False)
                            logger.info(f"[BANK_LEDGER] Deleted associated bank ledger entry for receipt ID: {receipt_id}, transaction: {transaction_id}")

                    # Delete from ReceiptAmountReceived
                    receipt_delete_query = "DELETE FROM ReceiptAmountReceived WHERE receipt_amount_id = %s"
                    execute_query(receipt_delete_query, (receipt_id,), fetch=False)
                    logger.info(f"[RECEIPT] Deleted associated receipt ID: {receipt_id} for ledger entry {ledger_id}")

                except (ValueError, Exception) as receipt_e:
                    logger.warning(f"[RECEIPT] Could not delete associated receipt for ledger {ledger_id}: {receipt_e}")
                    # For atomicity, we should fail the entire operation if receipt deletion fails
                    return jsonify({
                        "error": "Failed to delete associated records",
                        "message": f"Could not delete associated receipt data: {str(receipt_e)}",
                        "status": "error"
                    }), 500

            # Delete from CompanyLedger
            ledger_delete_query = "DELETE FROM CompanyLedger WHERE id = %s"
            execute_query(ledger_delete_query, (ledger_id,), fetch=False)

            logger.info(f"[LEDGER] Successfully deleted CompanyLedger entry ID: {ledger_id} and all associated records")
            return jsonify({
                "status": "success",
                "message": f"Ledger entry {ledger_id} and associated records deleted successfully"
            }), 200

        # If not found in CompanyLedger, check if it's an adjustment entry
        # Check client_adjustments table
        client_adjustment_query = """
            SELECT id, company_id, customer_id, particular_of_service, adjustment_amount
            FROM client_adjustments
            WHERE id = %s
        """
        client_results = execute_query(client_adjustment_query, (ledger_id,))

        if client_results and len(client_results) > 0:
            # This is a client adjustment entry
            adjustment_data = client_results[0]

            # Delete from client_adjustments
            delete_query = "DELETE FROM client_adjustments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[CLIENT_ADJUSTMENT] Deleted client adjustment entry ID: {ledger_id}, Amount: {adjustment_data['adjustment_amount']}")
            return jsonify({
                "status": "success",
                "message": f"Client adjustment entry {ledger_id} deleted successfully"
            }), 200

        # Check vendor_adjustments table
        vendor_adjustment_query = """
            SELECT id, company_id, vendor_id, particular_of_service, adjustment_amount
            FROM vendor_adjustments
            WHERE id = %s
        """
        vendor_results = execute_query(vendor_adjustment_query, (ledger_id,))

        if vendor_results and len(vendor_results) > 0:
            # This is a vendor adjustment entry
            adjustment_data = vendor_results[0]

            # Delete from vendor_adjustments
            delete_query = "DELETE FROM vendor_adjustments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_ADJUSTMENT] Deleted vendor adjustment entry ID: {ledger_id}, Amount: {adjustment_data['adjustment_amount']}")
            return jsonify({
                "status": "success",
                "message": f"Vendor adjustment entry {ledger_id} deleted successfully"
            }), 200

        # If not found in any table, return 404
        return jsonify({
            "error": "Ledger entry not found",
            "message": f"No ledger entry found with ID: {ledger_id}",
            "status": "not_found"
        }), 404

    except Exception as e:
        logger.error(f"[LEDGER] Failed to delete ledger entry {ledger_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete ledger entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-service-entry', methods=['POST'])
def create_vendor_service_entry():
    """Create a new vendor service entry in vendor_services table"""
    try:
        data = request.get_json()

        required_fields = ['vendorId', 'dateOfService', 'particularOfService', 'feesToBePaid']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate and convert data types
        try:
            vendor_id = int(data['vendorId'])
            company_id = int(data.get('companyId')) if data.get('companyId') else None
            fees = float(data['feesToBePaid'])
            if fees <= 0:
                raise ValueError("Fees must be positive")
        except (ValueError, TypeError) as e:
            return jsonify({
                "error": f"Invalid data type: {e}",
                "message": "Please check that IDs are valid integers and fees are a positive number",
                "status": "validation_error"
            }), 400

        # Insert into vendor_services
        query = """
            INSERT INTO vendor_services (
                vendor_id, company_id, service_date, particulars,
                amount, on_account_of, remark
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        params = (
            vendor_id,
            company_id,
            data['dateOfService'],
            data['particularOfService'],
            fees,
            data.get('onAccountOf'),
            data.get('remark')
        )

        result = execute_query(query, params)

        if result:
            entry_id = result[0]['id']
            logger.info(f"[VENDOR_SERVICE] Created vendor service entry ID: {entry_id}")
            return jsonify({
                "status": "success",
                "data": {"entry_id": entry_id},
                "message": f"Vendor service entry created successfully with ID: {entry_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create entry",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[VENDOR_SERVICE] Failed to create vendor service entry: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create vendor service entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-payment-entry', methods=['POST'])
def create_vendor_payment_entry():
    """Create a new vendor payment entry in vendor_payments and bank_ledger"""
    try:
        data = request.get_json()

        required_fields = ['vendorId', 'dateOfPayment', 'transactionId', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate and convert data types
        try:
            vendor_id = int(data['vendorId'])
            company_id = int(data.get('companyId')) if data.get('companyId') else None
            amount = float(data['amount'])
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except (ValueError, TypeError) as e:
            return jsonify({
                "error": f"Invalid data type: {e}",
                "message": "Please check that IDs are valid integers and amount is a positive number",
                "status": "validation_error"
            }), 400

        # Check if transaction_id is unique in vendor_payments
        check_query = "SELECT id FROM vendor_payments WHERE transaction_id = %s"
        check_result = execute_query(check_query, (data['transactionId'],))

        if check_result and len(check_result) > 0:
            return jsonify({
                "error": "Transaction ID already exists",
                "message": f"Transaction ID '{data['transactionId']}' is already used",
                "status": "validation_error"
            }), 400

        # Get vendor name for bank ledger
        vendor_query = "SELECT vendor_name FROM vendors WHERE id = %s"
        vendor_result = execute_query(vendor_query, (vendor_id,))

        if not vendor_result:
            return jsonify({
                "error": "Vendor not found",
                "message": f"No vendor found with ID: {vendor_id}",
                "status": "validation_error"
            }), 400

        vendor_name = vendor_result[0]['vendor_name']

        # Insert into vendor_payments
        payment_query = """
            INSERT INTO vendor_payments (
                vendor_id, company_id, payment_date, transaction_id,
                amount, on_account_of, remark
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        payment_params = (
            vendor_id,
            company_id,
            data['dateOfPayment'],
            data['transactionId'],
            amount,
            data.get('onAccountOf'),
            data.get('remark')
        )

        payment_result = execute_query(payment_query, payment_params)

        if payment_result:
            payment_id = payment_result[0]['id']

            # Insert into bank_ledger
            bank_query = """
                INSERT INTO bank_ledger (
                    payment_date, transaction_id, vendor_id, company_id, vendor_name,
                    amount, remark, transaction_type
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """

            bank_params = (
                data['dateOfPayment'],
                data['transactionId'],
                vendor_id,
                company_id,
                vendor_name,
                amount,
                f"Payment to {vendor_name} - {data['transactionId']}",
                'payment'
            )

            bank_result = execute_query(bank_query, bank_params)
            bank_created = bank_result is not None and len(bank_result) > 0

            logger.info(f"[VENDOR_PAYMENT] Created vendor payment entry ID: {payment_id}, bank entry: {bank_created}")

            return jsonify({
                "status": "success",
                "data": {
                    "payment_id": payment_id,
                    "bank_entry_created": bank_created
                },
                "message": f"Vendor payment entry created successfully with ID: {payment_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create payment entry",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[VENDOR_PAYMENT] Failed to create vendor payment entry: {e}")
        # Return more detailed error for debugging
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"[VENDOR_PAYMENT] Traceback: {error_details}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create vendor payment entry",
            "status": "error",
            "debug": {
                "vendor_id": data.get('vendorId'),
                "company_id": data.get('companyId'),
                "amount": data.get('amount'),
                "transaction_id": data.get('transactionId'),
                "date": data.get('dateOfPayment')
            }
        }), 500

@bookkeeping_bp.route('/expense-payment-entry', methods=['POST'])
def create_expense_payment_entry():
    """Create a new expense payment entry with double-entry accounting"""
    try:
        data = request.get_json()

        # Use provided transaction ID or generate unique one
        transaction_id = data.get('transactionId')
        if not transaction_id:
            import uuid
            transaction_id = str(uuid.uuid4())[:8].upper()

        # Get company_id if company name is provided
        company_id = None
        if data.get('company'):
            company_query = "SELECT id FROM company_details WHERE company_name = %s LIMIT 1"
            company_result = execute_query(company_query, (data['company'],))
            if company_result:
                company_id = company_result[0]['id']

        # Convert amount to float if provided
        amount = float(data.get('amount', 0)) if data.get('amount') else 0

        # Create double-entry accounting entries
        expense_particulars = f"Payment to {data.get('vendorName', 'Vendor')} for {data.get('description', data.get('expenseType', 'Expense'))}"
        bank_particulars = f"Expense payment for {data.get('expenseType', 'Expense')} to {data.get('vendorName', 'Vendor')}"

        # Insert expense ledger entry (debit)
        expense_query = """
            INSERT INTO expense_ledger (
                transaction_id, expense_type, company, vendor_name, vendor_gst_number,
                amount, expense_date, payment_method, description, particulars,
                debit, credit, account_type, company_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        expense_params = (
            transaction_id,
            data.get('expenseType'),
            data.get('company'),
            data.get('vendorName'),
            data.get('vendorGstNumber'),
            amount,
            data.get('expenseDate'),
            data.get('paymentMethod'),
            data.get('description'),
            expense_particulars,
            amount,  # debit
            0,       # credit
            'expense',
            company_id
        )

        expense_result = execute_query(expense_query, expense_params)

        # Insert bank ledger entry (credit) - into expense_ledger for accounting
        bank_query = """
            INSERT INTO expense_ledger (
                transaction_id, expense_type, company, vendor_name, vendor_gst_number,
                amount, expense_date, payment_method, description, particulars,
                debit, credit, account_type, company_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        bank_params = (
            transaction_id,
            data.get('expenseType'),
            data.get('company'),
            data.get('vendorName'),
            data.get('vendorGstNumber'),
            amount,
            data.get('expenseDate'),
            data.get('paymentMethod'),
            data.get('description'),
            bank_particulars,
            0,       # debit
            amount,  # credit
            'bank',
            company_id
        )

        bank_result = execute_query(bank_query, bank_params)

        # Also insert into bank_ledger table for bank reconciliation
        bank_ledger_query = """
            INSERT INTO bank_ledger (
                payment_date, transaction_id, vendor_id, company_id, vendor_name,
                amount, remark, transaction_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        bank_ledger_params = (
            data.get('expenseDate'),  # payment_date
            transaction_id,  # transaction_id
            None,  # vendor_id (not applicable for expense payments)
            company_id,  # company_id
            data.get('vendorName'),  # vendor_name
            amount,  # amount
            f"Expense payment: {data.get('expenseType', 'Expense')} to {data.get('vendorName', 'Vendor')}",  # remark
            'payment'  # transaction_type
        )

        execute_query(bank_ledger_query, bank_ledger_params, fetch=False)

        if expense_result and bank_result:
            expense_id = expense_result[0]['id']
            bank_id = bank_result[0]['id']

            # Log audit trail
            logger.info(f"[EXPENSE_PAYMENT] Created expense payment entry - Transaction ID: {transaction_id}, Amount: {amount}, Company: {data.get('company')}")

            # Flag for GST reconciliation if GST number provided
            gst_flag = bool(data.get('vendorGstNumber'))

            return jsonify({
                "status": "success",
                "data": {
                    "transaction_id": transaction_id,
                    "expense_entry_id": expense_id,
                    "bank_entry_id": bank_id,
                    "gst_reconciliation_flag": gst_flag
                },
                "message": f"Expense payment entry created successfully with transaction ID: {transaction_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create ledger entries",
                "message": "Database insertion failed",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[EXPENSE_PAYMENT] Failed to create expense payment entry: {e}")
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"[EXPENSE_PAYMENT] Traceback: {error_details}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create expense payment entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-ledger-report', methods=['GET'])
def get_vendor_ledger_report():
    """Get vendor ledger report with running balance"""
    try:
        vendor_id = request.args.get('vendor_id', type=int)
        company_id = request.args.get('company_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        if not vendor_id or not company_id:
            return jsonify({
                "error": "Vendor ID and Company ID are required",
                "message": "Please provide vendor_id and company_id parameters",
                "status": "validation_error"
            }), 400

        query = """
            SELECT * FROM VendorLedgerReport
            WHERE vendor_id = %s AND company_id = %s
        """
        params = [int(vendor_id), int(company_id)]  # Convert to int

        if start_date:
            query += " AND entry_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND entry_date <= %s"
            params.append(end_date)

        query += " ORDER BY entry_date DESC, id DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        results = execute_query(query, params)

        if results:
            entries = []
            for row in results:
                entries.append({
                    'id': row['id'],
                    'entry_date': str(row['entry_date']) if row['entry_date'] else None,
                    'vendor_name': row['vendor_name'],
                    'company_name': row['company_name'],
                    'type': row['type'],
                    'particulars': row['particulars'],
                    'remark': row['remark'],
                    'on_account_of': row['on_account_of'],
                    'dr': float(row['dr']) if row['dr'] else 0,
                    'cr': float(row['cr']) if row['cr'] else 0,
                    'transaction_id': row['transaction_id'],
                    'balance': float(row['balance']) if row['balance'] else 0
                })

            logger.info(f"[VENDOR_LEDGER] Retrieved {len(entries)} entries for vendor {vendor_id}, company {company_id}")
            return jsonify({
                "status": "success",
                "data": entries,
                "message": f"Retrieved {len(entries)} vendor ledger entries",
                "total": len(entries)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No vendor ledger entries found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[VENDOR_LEDGER] Failed to retrieve vendor ledger report: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendor ledger report",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/bank-ledger-report', methods=['GET'])
def get_bank_ledger_report():
    """Get bank ledger report with running balance, including expense credit entries"""
    try:
        company_id = request.args.get('company_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        if not company_id:
            return jsonify({
                "error": "Company ID is required",
                "message": "Please provide company_id parameter",
                "status": "validation_error"
            }), 400

        # Get company name for filtering
        company_query = "SELECT company_name FROM company_details WHERE id = %s"
        company_result = execute_query(company_query, (company_id,))

        if not company_result:
            return jsonify({
                "error": "Company not found",
                "message": f"No company found with ID: {company_id}",
                "status": "not_found"
            }), 404

        company_name = company_result[0]['company_name']

        # Query only bank_ledger table for clean separation
        full_query = """
            SELECT
                bl.id,
                bl.payment_date as entry_date,
                bl.transaction_id,
                bl.vendor_name,
                bl.amount as amount,
                bl.remark as particulars,
                bl.created_at,
                'bank_ledger' as source_table,
                NULL as expense_type,
                CASE WHEN bl.transaction_type = 'receipt' THEN bl.amount ELSE 0 END as debit,
                CASE WHEN bl.transaction_type = 'payment' THEN bl.amount ELSE 0 END as credit
            FROM bank_ledger bl
            WHERE bl.company_id = %s
        """
        params = [company_id]

        # Add date filters
        if start_date:
            full_query += " AND bl.payment_date >= %s"
            params.append(start_date)
        if end_date:
            full_query += " AND bl.payment_date <= %s"
            params.append(end_date)

        full_query += " ORDER BY entry_date DESC, id DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        logger.info(f"[BANK_LEDGER] Query: {full_query}")
        logger.info(f"[BANK_LEDGER] Params: {params}")

        results = execute_query(full_query, params)

        entries = []
        running_balance = 0

        if results:
            # Sort by date ascending for balance calculation
            sorted_results = sorted(results, key=lambda x: x['entry_date'])

            for row in sorted_results:
                dr_amount = float(row['debit']) if row['debit'] else 0
                cr_amount = float(row['credit']) if row['credit'] else 0

                # Calculate running balance (DR increases balance, CR decreases balance)
                running_balance += dr_amount - cr_amount

                entries.append({
                    'id': row['id'],
                    'entry_date': str(row['entry_date']) if row['entry_date'] else None,
                    'company_name': company_name,
                    'particulars': row['particulars'] or f"Entry - {row['transaction_id']}",
                    'transaction_id': row['transaction_id'],
                    'dr': dr_amount,
                    'cr': cr_amount,
                    'balance': running_balance,
                    'source': row['source_table'],
                    'expense_type': row['expense_type']
                })

            # Sort back to descending for display
            entries.sort(key=lambda x: x['entry_date'] or '1900-01-01', reverse=True)

            # Apply pagination after sorting
            paginated_entries = entries[offset:offset + limit]

            logger.info(f"[BANK_LEDGER] Retrieved {len(paginated_entries)} entries for company {company_id}")
            return jsonify({
                "status": "success",
                "data": paginated_entries,
                "message": f"Retrieved {len(paginated_entries)} bank ledger entries",
                "total": len(paginated_entries)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No bank ledger entries found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[BANK_LEDGER] Failed to retrieve bank ledger report: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve bank ledger report",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-ledger/<int:vendor_id>', methods=['GET'])
def get_vendor_ledger(vendor_id):
    """Get unified vendor ledger combining services and payments with running balance"""
    try:
        logger.info(f"[VENDOR_LEDGER] Starting request for vendor_id: {vendor_id}")

        # Validate vendor exists
        logger.info(f"[VENDOR_LEDGER] Checking if vendor {vendor_id} exists")
        vendor_check = execute_query("SELECT vendor_name FROM vendors WHERE id = %s", (vendor_id,))
        if not vendor_check:
            logger.warning(f"[VENDOR_LEDGER] Vendor {vendor_id} not found")
            return jsonify({
                "error": "Vendor not found",
                "message": f"No vendor found with ID: {vendor_id}",
                "status": "not_found"
            }), 404

        vendor_name = vendor_check[0]['vendor_name']
        logger.info(f"[VENDOR_LEDGER] Found vendor: {vendor_name}")

        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)

        logger.info(f"[VENDOR_LEDGER] Query params - start_date: {start_date}, end_date: {end_date}, limit: {limit}, offset: {offset}")

        # Build the UNION query with proper date filtering
        union_query_parts = []

        # Services query
        services_query = """
            SELECT
                'service' AS entry_type,
                service_date AS entry_date,
                'service' AS type,
                particulars,
                amount AS dr,
                0 AS cr,
                'Service' AS entry_type_display,
                id,
                vendor_id,
                NULL AS transaction_id
            FROM vendor_services
            WHERE vendor_id = %s
        """
        services_params = [vendor_id]

        # Add date filters to services query
        if start_date:
            services_query += " AND service_date >= %s"
            services_params.append(start_date)
        if end_date:
            services_query += " AND service_date <= %s"
            services_params.append(end_date)

        union_query_parts.append(services_query)

        # Payments query
        payments_query = """
            SELECT
                'payment' AS entry_type,
                payment_date AS entry_date,
                'payment' AS type,
                transaction_id AS particulars,
                0 AS dr,
                amount AS cr,
                'Payment' AS entry_type_display,
                id,
                vendor_id,
                transaction_id
            FROM vendor_payments
            WHERE vendor_id = %s
        """
        payments_params = [vendor_id]

        # Add date filters to payments query
        if start_date:
            payments_query += " AND payment_date >= %s"
            payments_params.append(start_date)
        if end_date:
            payments_query += " AND payment_date <= %s"
            payments_params.append(end_date)

        union_query_parts.append(payments_query)

        # Vendor adjustments query
        adjustments_query = """
            SELECT
                'adjustment' AS entry_type,
                va.date_of_service AS entry_date,
                'adjustment' AS type,
                va.particular_of_service AS particulars,
                CASE WHEN va.adjustment_amount < 0 THEN ABS(va.adjustment_amount) ELSE 0 END AS dr,
                CASE WHEN va.adjustment_amount > 0 THEN va.adjustment_amount ELSE 0 END AS cr,
                'Adjustment' AS entry_type_display,
                va.id,
                va.vendor_id,
                CONCAT('ADJ-', va.id) AS transaction_id
            FROM vendor_adjustments va
            WHERE va.vendor_id = %s
        """
        adjustments_params = [vendor_id]

        # Add date filters to adjustments query
        if start_date:
            adjustments_query += " AND va.date_of_service >= %s"
            adjustments_params.append(start_date)
        if end_date:
            adjustments_query += " AND va.date_of_service <= %s"
            adjustments_params.append(end_date)

        union_query_parts.append(adjustments_query)

        # Combine queries
        union_query = " UNION ALL ".join(union_query_parts)
        params = services_params + payments_params + adjustments_params
        logger.info(f"[VENDOR_LEDGER] Final query params: {params}")

        # Order by date and apply pagination
        union_query += " ORDER BY entry_date DESC, type DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        logger.info(f"[VENDOR_LEDGER] Final query: {union_query}")
        logger.info(f"[VENDOR_LEDGER] Final params: {params}")

        results = execute_query(union_query, params)
        logger.info(f"[VENDOR_LEDGER] Query executed successfully, results count: {len(results) if results else 0}")

        entries = []
        running_balance = 0

        if results:
            # Sort by date ascending for balance calculation
            sorted_results = sorted(results, key=lambda x: x['entry_date'])

            for row in sorted_results:
                dr_amount = float(row['dr']) if row['dr'] else 0
                cr_amount = float(row['cr']) if row['cr'] else 0

                # Calculate running balance (DR increases balance, CR decreases)
                running_balance += dr_amount - cr_amount

                entries.append({
                    'id': row['id'],
                    'entry_type': row['entry_type'],
                    'date': str(row['entry_date']) if row['entry_date'] else None,
                    'particulars': row['particulars'] or '',
                    'type': row['entry_type_display'] or '',
                    'dr': dr_amount,
                    'cr': cr_amount,
                    'balance': running_balance,
                    'transaction_id': row['transaction_id']
                })

            # Sort back to descending for display
            entries.sort(key=lambda x: x['date'] or '1900-01-01', reverse=True)

        logger.info(f"[VENDOR_LEDGER] Retrieved {len(entries)} ledger entries for vendor {vendor_id}")

        return jsonify({
            "status": "success",
            "data": {
                "vendor_name": vendor_name,
                "entries": entries,
                "total_entries": len(entries),
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "has_more": len(entries) == limit
                }
            },
            "message": f"Retrieved {len(entries)} ledger entries for {vendor_name}",
            "total": len(entries)
        }), 200

    except Exception as e:
        logger.error(f"[VENDOR_LEDGER] Failed to retrieve vendor ledger for {vendor_id}: {e}")
        import traceback
        logger.error(f"[VENDOR_LEDGER] Traceback: {traceback.format_exc()}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendor ledger",
            "status": "error",
            "debug_info": {
                "vendor_id": vendor_id,
                "query_params": dict(request.args)
            }
        }), 500

@bookkeeping_bp.route('/vendor-service/<int:service_id>', methods=['DELETE'])
def delete_vendor_service(service_id):
    """Delete a vendor service entry"""
    try:
        # Check if the record exists
        check_query = """
            SELECT id, vendor_id, particulars, amount
            FROM vendor_services
            WHERE id = %s
        """
        check_result = execute_query(check_query, (service_id,))

        if not check_result or len(check_result) == 0:
            return jsonify({
                "error": "Service entry not found",
                "message": f"No vendor service entry found with ID: {service_id}",
                "status": "not_found"
            }), 404

        service_data = check_result[0]

        # Delete the record
        delete_query = "DELETE FROM vendor_services WHERE id = %s"
        execute_query(delete_query, (service_id,), fetch=False)

        logger.info(f"[VENDOR_SERVICE] Deleted service entry ID: {service_id}, Vendor: {service_data['vendor_id']}, Amount: {service_data['amount']}")
        return jsonify({
            "status": "success",
            "message": f"Vendor service entry ID {service_id} deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"[VENDOR_SERVICE] Failed to delete service entry ID {service_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete vendor service entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-ledger/<int:ledger_id>', methods=['DELETE'])
def delete_vendor_ledger_entry(ledger_id):
    """Delete a vendor ledger entry (service, payment, or adjustment) based on the source table"""
    try:
        # First, check if this is a vendor service entry
        service_query = """
            SELECT id, vendor_id, particulars, amount
            FROM vendor_services
            WHERE id = %s
        """
        service_result = execute_query(service_query, (ledger_id,))

        if service_result and len(service_result) > 0:
            # This is a vendor service entry
            service_data = service_result[0]

            # Delete from vendor_services
            delete_query = "DELETE FROM vendor_services WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_SERVICE] Deleted service entry ID: {ledger_id}, Vendor: {service_data['vendor_id']}, Amount: {service_data['amount']}")
            return jsonify({
                "status": "success",
                "message": f"Vendor service entry {ledger_id} deleted successfully"
            }), 200

        # Check if this is a vendor payment entry
        payment_query = """
            SELECT id, vendor_id, transaction_id, amount
            FROM vendor_payments
            WHERE id = %s
        """
        payment_result = execute_query(payment_query, (ledger_id,))

        if payment_result and len(payment_result) > 0:
            # This is a vendor payment entry
            payment_data = payment_result[0]

            # Delete associated bank ledger entry if it exists
            bank_delete_query = "DELETE FROM bank_ledger WHERE transaction_id = %s"
            execute_query(bank_delete_query, (payment_data['transaction_id'],), fetch=False)
            logger.info(f"[BANK_LEDGER] Deleted associated bank entry for payment ID: {ledger_id}")

            # Delete the payment record
            delete_query = "DELETE FROM vendor_payments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_PAYMENT] Deleted payment entry ID: {ledger_id}, Vendor: {payment_data['vendor_id']}, Amount: {payment_data['amount']}")
            return jsonify({
                "status": "success",
                "message": f"Vendor payment entry {ledger_id} deleted successfully"
            }), 200

        # Check if this is a vendor adjustment entry
        adjustment_query = """
            SELECT id, vendor_id, particular_of_service, adjustment_amount
            FROM vendor_adjustments
            WHERE id = %s
        """
        adjustment_result = execute_query(adjustment_query, (ledger_id,))

        if adjustment_result and len(adjustment_result) > 0:
            # This is a vendor adjustment entry
            adjustment_data = adjustment_result[0]

            # Delete from vendor_adjustments
            delete_query = "DELETE FROM vendor_adjustments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_ADJUSTMENT] Deleted adjustment entry ID: {ledger_id}, Vendor: {adjustment_data['vendor_id']}, Amount: {adjustment_data['adjustment_amount']}")
            return jsonify({
                "status": "success",
                "message": f"Vendor adjustment entry {ledger_id} deleted successfully"
            }), 200

        # If not found in any table, return 404
        return jsonify({
            "error": "Ledger entry not found",
            "message": f"No vendor ledger entry found with ID: {ledger_id}",
            "status": "not_found"
        }), 404

    except Exception as e:
        logger.error(f"[VENDOR_LEDGER] Failed to delete vendor ledger entry {ledger_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete vendor ledger entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-payment/<int:payment_id>', methods=['DELETE'])
def delete_vendor_payment(payment_id):
    """Delete a vendor payment entry and associated bank ledger entry"""
    try:
        # Check if the record exists in vendor_payments
        check_query = """
            SELECT id, vendor_id, transaction_id, amount
            FROM vendor_payments
            WHERE id = %s
        """
        check_result = execute_query(check_query, (payment_id,))

        if not check_result or len(check_result) == 0:
            # Check if the ID exists in other vendor-related tables to provide better error message
            service_check = execute_query("SELECT id FROM vendor_services WHERE id = %s", (payment_id,))
            adjustment_check = execute_query("SELECT id FROM vendor_adjustments WHERE id = %s", (payment_id,))

            if service_check and len(service_check) > 0:
                return jsonify({
                    "error": "Invalid entry type",
                    "message": f"ID {payment_id} belongs to a vendor service entry, not a payment entry. Please refresh the page and try again.",
                    "status": "invalid_type"
                }), 400
            elif adjustment_check and len(adjustment_check) > 0:
                return jsonify({
                    "error": "Invalid entry type",
                    "message": f"ID {payment_id} belongs to a vendor adjustment entry, not a payment entry. Please refresh the page and try again.",
                    "status": "invalid_type"
                }), 400
            else:
                return jsonify({
                    "error": "Payment entry not found",
                    "message": f"No vendor payment entry found with ID: {payment_id}",
                    "status": "not_found"
                }), 404

        payment_data = check_result[0]

        # Delete associated bank ledger entry if it exists
        bank_delete_query = "DELETE FROM bank_ledger WHERE transaction_id = %s"
        execute_query(bank_delete_query, (payment_data['transaction_id'],), fetch=False)
        logger.info(f"[BANK_LEDGER] Deleted associated bank entry for payment ID: {payment_id}")

        # Delete the payment record
        delete_query = "DELETE FROM vendor_payments WHERE id = %s"
        execute_query(delete_query, (payment_id,), fetch=False)

        logger.info(f"[VENDOR_PAYMENT] Deleted payment entry ID: {payment_id}, Vendor: {payment_data['vendor_id']}, Amount: {payment_data['amount']}")
        return jsonify({
            "status": "success",
            "message": f"Vendor payment entry ID {payment_id} deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"[VENDOR_PAYMENT] Failed to delete payment entry ID {payment_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete vendor payment entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/expense-ledger', methods=['GET'])
def get_expense_ledger():
    """Get expense ledger entries (debit entries only) with filtering and pagination"""
    try:
        # Get query parameters
        company_id = request.args.get('company_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        expense_type = request.args.get('expense_type', '').strip()
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        if not company_id:
            return jsonify({
                "error": "Company ID is required",
                "message": "Please provide company_id parameter",
                "status": "validation_error"
            }), 400

        # Query expense_ledger table for debit entries only
        query = """
            SELECT
                id,
                transaction_id,
                expense_type,
                company,
                vendor_name,
                vendor_gst_number,
                amount,
                expense_date,
                payment_method,
                description,
                particulars,
                debit,
                credit,
                account_type,
                created_at
            FROM expense_ledger
            WHERE company_id = %s AND debit > 0
        """
        params = [company_id]

        if start_date:
            query += " AND expense_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND expense_date <= %s"
            params.append(end_date)
        if expense_type:
            query += " AND expense_type ILIKE %s"
            params.append(f"%{expense_type}%")

        query += " ORDER BY expense_date DESC, created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        results = execute_query(query, params)

        entries = []
        total_debit = 0
        total_credit = 0

        if results:
            logger.info(f"[EXPENSE_LEDGER] Found {len(results)} debit entries in expense_ledger")
            for row in results:
                debit_amount = float(row['debit']) if row['debit'] else 0
                credit_amount = float(row['credit']) if row['credit'] else 0
                entries.append({
                    'id': row['id'],
                    'transaction_id': row['transaction_id'] or '',
                    'expense_date': str(row['expense_date']) if row['expense_date'] else None,
                    'expense_type': row['expense_type'] or '',
                    'vendor_name': row['vendor_name'] or '',
                    'particulars': row['particulars'] or '',
                    'debit': debit_amount,
                    'credit': credit_amount,
                    'amount': float(row['amount']) if row['amount'] else 0,
                    'payment_method': row['payment_method'] or '',
                    'description': row['description'] or '',
                    'company': row['company'] or '',
                    'account_type': row['account_type'] or 'expense'
                })
                total_debit += debit_amount
                total_credit += credit_amount

        # Calculate summary
        closing_balance = total_debit - total_credit
        balance_type = 'Outstanding' if closing_balance > 0 else 'Advance' if closing_balance < 0 else 'Settled'

        summary = {
            'opening_balance': 0,
            'total_debit': total_debit,
            'total_credit': total_credit,
            'closing_balance': abs(closing_balance),
            'balance_type': balance_type
        }

        logger.info(f"[EXPENSE_LEDGER] Returning {len(entries)} debit entries for company {company_id}")

        return jsonify({
            "status": "success",
            "data": {
                "entries": entries,
                "summary": summary,
                "total_entries": len(entries),
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "has_more": len(entries) == limit
                }
            },
            "message": f"Retrieved {len(entries)} expense ledger debit entries",
            "total": len(entries)
        }), 200

    except Exception as e:
        logger.error(f"[EXPENSE_LEDGER] Failed to retrieve expense ledger: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve expense ledger data",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/expense-ledger/<int:entry_id>', methods=['DELETE'])
def delete_expense_ledger_entry(entry_id):
    """Delete an expense ledger entry and its corresponding credit entry if applicable"""
    try:
        # Check if the record exists
        check_query = """
            SELECT id, expense_type, amount, account_type, debit, credit, company, vendor_name, expense_date
            FROM expense_ledger
            WHERE id = %s
        """
        check_result = execute_query(check_query, (entry_id,))

        if not check_result or len(check_result) == 0:
            return jsonify({
                "error": "Expense ledger entry not found",
                "message": f"No expense ledger entry found with ID: {entry_id}",
                "status": "not_found"
            }), 404

        entry_data = check_result[0]

        # If this is a debit entry (expense), also delete the corresponding credit entry (bank)
        if entry_data['account_type'] == 'expense' and entry_data['debit'] > 0:
            # Find the corresponding credit entry by matching key fields
            # Since transaction_id was dropped, match by expense_type, company, vendor_name, amount, expense_date
            credit_query = """
                SELECT id
                FROM expense_ledger
                WHERE expense_type = %s AND company = %s AND vendor_name = %s AND amount = %s
                      AND expense_date = %s AND account_type = 'bank' AND credit > 0
            """
            credit_result = execute_query(credit_query, (
                entry_data['expense_type'],
                entry_data['company'],
                entry_data['vendor_name'],
                entry_data['amount'],
                entry_data['expense_date']
            ))

            if credit_result and len(credit_result) > 0:
                credit_entry_id = credit_result[0]['id']
                # Delete the credit entry
                delete_credit_query = "DELETE FROM expense_ledger WHERE id = %s"
                execute_query(delete_credit_query, (credit_entry_id,), fetch=False)
                logger.info(f"[EXPENSE_LEDGER] Deleted corresponding credit entry ID: {credit_entry_id} for expense entry {entry_id}")

            # Also delete from bank_ledger table using transaction_id
            if entry_data.get('transaction_id'):
                bank_ledger_delete_query = "DELETE FROM bank_ledger WHERE transaction_id = %s"
                execute_query(bank_ledger_delete_query, (entry_data['transaction_id'],), fetch=False)
                logger.info(f"[BANK_LEDGER] Deleted corresponding bank ledger entry for transaction: {entry_data['transaction_id']}")

        # Delete the specific entry
        delete_query = "DELETE FROM expense_ledger WHERE id = %s"
        execute_query(delete_query, (entry_id,), fetch=False)

        logger.info(f"[EXPENSE_LEDGER] Deleted expense ledger entry ID: {entry_id}, Amount: {entry_data['amount']}")
        return jsonify({
            "status": "success",
            "message": f"Expense ledger entry ID {entry_id} deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"[EXPENSE_LEDGER] Failed to delete expense ledger entry ID {entry_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete expense ledger entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/bank-ledger/<int:entry_id>', methods=['DELETE'])
def delete_bank_ledger_entry(entry_id):
    """Delete a bank ledger entry from bank_ledger table"""
    try:
        # Check if the record exists in bank_ledger table
        check_query = """
            SELECT id, transaction_id, amount, vendor_name, payment_date
            FROM bank_ledger
            WHERE id = %s
        """
        check_result = execute_query(check_query, (entry_id,))

        if not check_result or len(check_result) == 0:
            return jsonify({
                "error": "Bank ledger entry not found",
                "message": f"No bank ledger entry found with ID: {entry_id}",
                "status": "not_found"
            }), 404

        entry_data = check_result[0]

        # If this is an expense payment entry, also delete from expense_ledger
        if entry_data.get('transaction_id'):
            # Check if this transaction_id exists in expense_ledger (for expense payments)
            expense_check_query = "SELECT id FROM expense_ledger WHERE transaction_id = %s"
            expense_result = execute_query(expense_check_query, (entry_data['transaction_id'],))

            if expense_result and len(expense_result) > 0:
                # This is an expense payment, delete both expense and bank entries
                expense_delete_query = "DELETE FROM expense_ledger WHERE transaction_id = %s"
                execute_query(expense_delete_query, (entry_data['transaction_id'],), fetch=False)
                logger.info(f"[EXPENSE_LEDGER] Deleted expense entries for transaction: {entry_data['transaction_id']}")

        # Delete the bank ledger entry
        delete_query = "DELETE FROM bank_ledger WHERE id = %s"
        execute_query(delete_query, (entry_id,), fetch=False)

        logger.info(f"[BANK_LEDGER] Deleted bank ledger entry ID: {entry_id}, Transaction: {entry_data.get('transaction_id', 'N/A')}, Amount: {entry_data['amount']}")
        return jsonify({
            "status": "success",
            "message": f"Bank ledger entry ID {entry_id} deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"[BANK_LEDGER] Failed to delete bank ledger entry ID {entry_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete bank ledger entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/adjustments', methods=['POST'])
def create_adjustment():
    """Create a new adjustment entry"""
    try:
        data = request.get_json()

        required_fields = ['adjustment_type', 'company_id', 'date_of_service', 'particular_of_service', 'adjustment_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate adjustment_type
        if data['adjustment_type'] not in ['client', 'vendor']:
            return jsonify({
                "error": "Invalid adjustment type",
                "message": "Adjustment type must be 'client' or 'vendor'",
                "status": "validation_error"
            }), 400

        # Validate that either customer_id or vendor_id is provided based on type
        if data['adjustment_type'] == 'client' and 'customer_id' not in data:
            return jsonify({
                "error": "Missing customer_id",
                "message": "customer_id is required for client adjustments",
                "status": "validation_error"
            }), 400

        if data['adjustment_type'] == 'vendor' and 'vendor_id' not in data:
            return jsonify({
                "error": "Missing vendor_id",
                "message": "vendor_id is required for vendor adjustments",
                "status": "validation_error"
            }), 400

        # Validate amount is non-zero
        try:
            amount = float(data['adjustment_amount'])
            if amount == 0:
                raise ValueError("Amount must be non-zero")
        except (ValueError, TypeError):
            return jsonify({
                "error": "Invalid adjustment amount",
                "message": "Adjustment amount must be a non-zero number",
                "status": "validation_error"
            }), 400

        # Ensure appropriate adjustment table exists
        if data['adjustment_type'] == 'client':
            create_table_query = """
                CREATE TABLE IF NOT EXISTS client_adjustments (
                    id SERIAL PRIMARY KEY,
                    company_id INTEGER NOT NULL,
                    customer_id INTEGER NOT NULL,
                    date_of_service DATE NOT NULL,
                    particular_of_service TEXT NOT NULL,
                    adjustment_amount DECIMAL(15,2) NOT NULL CHECK (adjustment_amount != 0),
                    on_account_of TEXT,
                    remark TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (company_id) REFERENCES company_details(id),
                    FOREIGN KEY (customer_id) REFERENCES b2bcustomersdetails(id)
                )
            """
        else:  # vendor
            create_table_query = """
                CREATE TABLE IF NOT EXISTS vendor_adjustments (
                    id SERIAL PRIMARY KEY,
                    company_id INTEGER NOT NULL,
                    vendor_id INTEGER NOT NULL,
                    date_of_service DATE NOT NULL,
                    particular_of_service TEXT NOT NULL,
                    adjustment_amount DECIMAL(15,2) NOT NULL CHECK (adjustment_amount != 0),
                    on_account_of TEXT,
                    remark TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (company_id) REFERENCES company_details(id),
                    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
                )
            """
        execute_query(create_table_query, fetch=False)

        # Insert adjustment entry into appropriate table
        if data['adjustment_type'] == 'client':
            insert_query = """
                INSERT INTO client_adjustments (
                    company_id, customer_id, date_of_service, particular_of_service,
                    adjustment_amount, on_account_of, remark
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            params = (
                data['company_id'],
                data['customer_id'],
                data['date_of_service'],
                data['particular_of_service'],
                amount,
                data.get('on_account_of'),
                data.get('remark')
            )
        else:  # vendor
            insert_query = """
                INSERT INTO vendor_adjustments (
                    company_id, vendor_id, date_of_service, particular_of_service,
                    adjustment_amount, on_account_of, remark
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            params = (
                data['company_id'],
                data['vendor_id'],
                data['date_of_service'],
                data['particular_of_service'],
                amount,
                data.get('on_account_of'),
                data.get('remark')
            )

        result = execute_query(insert_query, params)

        if result:
            adjustment_id = result[0]['id']
            logger.info(f"[ADJUSTMENT] Created adjustment entry ID: {adjustment_id}, Type: {data['adjustment_type']}, Amount: {amount}")
            return jsonify({
                "status": "success",
                "data": {"adjustment_id": adjustment_id},
                "message": f"Adjustment entry created successfully with ID: {adjustment_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create adjustment",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[ADJUSTMENT] Failed to create adjustment entry: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create adjustment entry",
            "status": "error"
        }), 500