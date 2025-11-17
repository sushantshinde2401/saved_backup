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

        # Ensure ClientLedger table exists
        create_table_query = """
            CREATE TABLE IF NOT EXISTS ClientLedger (
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
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_company_name ON ClientLedger(company_name)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_date ON ClientLedger(date)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_voucher_no ON ClientLedger(voucher_no)"
        ]
        for index_query in index_queries:
            try:
                execute_query(index_query, fetch=False)
            except Exception as idx_e:
                logger.warning(f"[LEDGER] Could not create index: {idx_e}")

        # Insert into ClientLedger table
        query = """
            INSERT INTO ClientLedger (
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

        # Handle selectedCourses from frontend and convert to selected_courses for database
        if 'selectedCourses' in data:
            # Convert array of course names to comma-separated string or keep as is
            selected_courses = data['selectedCourses']
            if isinstance(selected_courses, list):
                # Check if list is not empty
                if selected_courses:
                    # Join array elements with comma separator
                    data['selected_courses'] = ', '.join(str(course) for course in selected_courses)
                else:
                    # Empty list, set to None so it defaults to 'N/A' in master table
                    data['selected_courses'] = None
            elif isinstance(selected_courses, dict):
                # Handle case where it's an empty object {}
                if selected_courses:
                    # If dict has content, convert to string representation
                    data['selected_courses'] = str(selected_courses)
                else:
                    # Empty dict, set to None
                    data['selected_courses'] = None
            elif isinstance(selected_courses, str) and selected_courses.strip():
                # If it's a non-empty string, use as is
                data['selected_courses'] = selected_courses.strip()
            else:
                # Empty or invalid, set to None
                data['selected_courses'] = None

        # Log the incoming data for debugging
        logger.info(f"[RECEIPT_INVOICE] Received data: {data}")
        logger.info(f"[RECEIPT_INVOICE] selectedCourses: {data.get('selectedCourses')}")

        # Use the existing database function
        from database.db_connection import insert_receipt_invoice_data
        result = insert_receipt_invoice_data(data)

        # After successful insertion, update the master table
        try:
            from hooks.post_data_insert import update_master_table_after_receipt_insert
            update_master_table_after_receipt_insert(data['candidate_id'], result)
            logger.info(f"[RECEIPT_INVOICE] Master table updated for candidate_id: {data['candidate_id']}")
        except Exception as update_e:
            logger.warning(f"[RECEIPT_INVOICE] Failed to update master table: {update_e}")
            # Don't fail the receipt creation if master table update fails

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

            # PDF generation will be handled by frontend autoSaveInvoice for exact visual replica
            logger.info(f"[RECEIPT_INVOICE] Skipping backend PDF generation - frontend will handle exact visual replica for receipt ID: {receipt_id}")

            # After creating receipt, insert into ClientLedger and Bank Ledger
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
                        # Insert into ClientLedger (Client Ledger)
                        ledger_query = """
                            INSERT INTO ClientLedger (
                                company_name, date, particulars, voucher_no, voucher_type,
                                debit, credit, entry_type
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """

                        particulars = f"Receipt from {customer_name}"
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
        ledger_delete_query = "DELETE FROM ClientLedger WHERE voucher_no = %s"
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
    """Get company ledger data from ClientLedger table with filtering and pagination"""
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
            CREATE TABLE IF NOT EXISTS ClientLedger (
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
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_company_name ON ClientLedger(company_name)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_date ON ClientLedger(date)",
            "CREATE INDEX IF NOT EXISTS idx_company_ledger_voucher_no ON ClientLedger(voucher_no)"
        ]
        for index_query in index_queries:
            try:
                execute_query(index_query, fetch=False)
            except Exception as idx_e:
                logger.warning(f"[LEDGER] Could not create index: {idx_e}")

        # Build UNION query for ClientLedger and adjustment entries
        union_queries = []

        # ClientLedger entries
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
            FROM ClientLedger
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
            logger.info(f"[LEDGER] Found {len(ledger_results)} entries in ClientLedger")
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
            logger.info(f"[LEDGER] No entries found in ClientLedger for company: {company_name}")

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

@bookkeeping_bp.route('/vendor-ledger/<int:vendor_id>', methods=['GET'])
def get_vendor_ledger(vendor_id):
    """Get vendor ledger data from VendorLedgerReport view with filtering and pagination"""
    try:
        # Get query parameters
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        logger.info(f"[VENDOR_LEDGER] Fetching ledger data for vendor ID: {vendor_id}")

        # Ensure VendorLedger table exists
        create_vendor_ledger_query = """
            CREATE TABLE IF NOT EXISTS VendorLedger (
                id SERIAL PRIMARY KEY,
                entry_date DATE NOT NULL,
                vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                company_id INTEGER NOT NULL REFERENCES company_details(id) ON DELETE CASCADE,
                type entry_type NOT NULL,
                particulars TEXT,
                remark TEXT,
                on_account_of TEXT,
                dr DECIMAL(15,2) CHECK (dr IS NULL OR dr > 0),
                cr DECIMAL(15,2) CHECK (cr IS NULL OR cr > 0),
                transaction_id VARCHAR(100) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_vendor_ledger_query, fetch=False)

        # Build UNION query for vendor_services, vendor_payments, and vendor_adjustments
        union_queries = []

        # Vendor Services entries (debits)
        services_query = """
            SELECT
                vs.id,
                vs.service_date as entry_date,
                v.vendor_name,
                COALESCE(cd.company_name, 'N/A') as company_name,
                'Service' as type,
                vs.particulars,
                vs.remark,
                vs.on_account_of,
                vs.amount as dr,
                0 as cr,
                NULL as transaction_id,
                'vendor_service' as source_table
            FROM vendor_services vs
            JOIN vendors v ON vs.vendor_id = v.id
            LEFT JOIN company_details cd ON vs.company_id = cd.id
            WHERE vs.vendor_id = %s
        """
        services_params = [vendor_id]

        if start_date:
            services_query += " AND vs.service_date >= %s"
            services_params.append(start_date)
        if end_date:
            services_query += " AND vs.service_date <= %s"
            services_params.append(end_date)

        union_queries.append(services_query)

        # Vendor Payments entries (credits)
        payments_query = """
            SELECT
                vp.id,
                vp.payment_date as entry_date,
                v.vendor_name,
                COALESCE(cd.company_name, 'N/A') as company_name,
                'Payment' as type,
                CONCAT('Payment - ', vp.transaction_id) as particulars,
                vp.remark,
                vp.on_account_of,
                0 as dr,
                vp.amount as cr,
                vp.transaction_id,
                'vendor_payment' as source_table
            FROM vendor_payments vp
            JOIN vendors v ON vp.vendor_id = v.id
            LEFT JOIN company_details cd ON vp.company_id = cd.id
            WHERE vp.vendor_id = %s
        """
        payments_params = [vendor_id]

        if start_date:
            payments_query += " AND vp.payment_date >= %s"
            payments_params.append(start_date)
        if end_date:
            payments_query += " AND vp.payment_date <= %s"
            payments_params.append(end_date)

        union_queries.append(payments_query)

        # Vendor Adjustments entries
        adjustments_query = """
            SELECT
                va.id,
                va.date_of_service as entry_date,
                v.vendor_name,
                cd.company_name,
                'Adjustment' as type,
                va.particular_of_service as particulars,
                va.remark,
                va.on_account_of,
                CASE WHEN va.adjustment_amount < 0 THEN ABS(va.adjustment_amount) ELSE 0 END as dr,
                CASE WHEN va.adjustment_amount > 0 THEN va.adjustment_amount ELSE 0 END as cr,
                CONCAT('ADJ-', va.id) as transaction_id,
                'vendor_adjustment' as source_table
            FROM vendor_adjustments va
            JOIN vendors v ON va.vendor_id = v.id
            JOIN company_details cd ON va.company_id = cd.id
            WHERE va.vendor_id = %s
        """
        adjustments_params = [vendor_id]

        if start_date:
            adjustments_query += " AND va.date_of_service >= %s"
            adjustments_params.append(start_date)
        if end_date:
            adjustments_query += " AND va.date_of_service <= %s"
            adjustments_params.append(end_date)

        union_queries.append(adjustments_query)

        # Combine all queries with UNION ALL
        full_query = " UNION ALL ".join(union_queries)

        # Wrap in subquery for ordering and balance calculation
        ordered_query = f"""
            SELECT *,
                SUM(COALESCE(dr, 0) - COALESCE(cr, 0))
                    OVER (
                        PARTITION BY vendor_name
                        ORDER BY entry_date, id
                        ROWS UNBOUNDED PRECEDING
                    ) AS balance
            FROM ({full_query}) as combined_entries
            ORDER BY entry_date DESC, id DESC
        """

        # Combine all parameters
        all_params = services_params + payments_params + adjustments_params

        # Get total count first
        count_query = f"SELECT COUNT(*) as total FROM ({full_query}) as subquery"
        count_result = execute_query(count_query, all_params)
        total_entries = count_result[0]['total'] if count_result else 0

        # Apply pagination
        paginated_query = ordered_query + " LIMIT %s OFFSET %s"
        all_params.extend([limit, offset])

        ledger_results = execute_query(paginated_query, all_params)

        entries = []
        if ledger_results:
            logger.info(f"[VENDOR_LEDGER] Found {len(ledger_results)} entries for vendor ID: {vendor_id}")
            for row in ledger_results:
                entries.append({
                    'id': row['id'],
                    'date': str(row['entry_date']) if row['entry_date'] else None,
                    'vendor_name': row['vendor_name'] or '',
                    'company_name': row['company_name'] or '',
                    'type': row['type'] or 'Service',
                    'particulars': row['particulars'] or '',
                    'remark': row['remark'] or '',
                    'on_account_of': row['on_account_of'] or '',
                    'dr': float(row['dr']) if row['dr'] else 0,
                    'cr': float(row['cr']) if row['cr'] else 0,
                    'balance': float(row['balance']) if row['balance'] else 0,
                    'entry_type': row['type'] or 'service'
                })

        # Calculate summary
        total_dr = sum(entry['dr'] for entry in entries)
        total_cr = sum(entry['cr'] for entry in entries)
        closing_balance = total_dr - total_cr
        balance_type = 'Outstanding' if closing_balance > 0 else 'Advance' if closing_balance < 0 else 'Settled'

        summary = {
            'opening_balance': 0,
            'total_debit': total_dr,
            'total_credit': total_cr,
            'closing_balance': abs(closing_balance),
            'balance_type': balance_type
        }

        logger.info(f"[VENDOR_LEDGER] Returning {len(entries)} paginated entries for vendor ID: {vendor_id}")

        return jsonify({
            "status": "success",
            "data": {
                "entries": entries,
                "summary": summary,
                "total_entries": total_entries,
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + limit) < total_entries
                }
            },
            "message": f"Retrieved {len(entries)} vendor ledger entries for vendor ID: {vendor_id}",
            "total": len(entries)
        }), 200

    except Exception as e:
        logger.error(f"[VENDOR_LEDGER] Failed to retrieve vendor ledger for vendor ID {vendor_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendor ledger data",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-ledger/<int:ledger_id>', methods=['DELETE'])
def delete_vendor_ledger_entry(ledger_id):
    """Delete a vendor ledger entry based on the source table"""
    try:
        # First, check if this is a vendor service entry
        service_query = """
            SELECT id, vendor_id, company_id
            FROM vendor_services
            WHERE id = %s
        """
        service_results = execute_query(service_query, (ledger_id,))

        if service_results and len(service_results) > 0:
            # Delete from vendor_services
            delete_query = "DELETE FROM vendor_services WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_LEDGER] Deleted vendor service entry ID: {ledger_id}")
            return jsonify({
                "status": "success",
                "message": f"Vendor service entry ID {ledger_id} deleted successfully"
            }), 200

        # Check if this is a vendor payment entry
        payment_query = """
            SELECT id, vendor_id, company_id, transaction_id
            FROM vendor_payments
            WHERE id = %s
        """
        payment_results = execute_query(payment_query, (ledger_id,))

        if payment_results and len(payment_results) > 0:
            transaction_id = payment_results[0]['transaction_id']

            # Delete associated bank ledger entry if transaction_id exists
            if transaction_id:
                bank_ledger_delete_query = "DELETE FROM bank_ledger WHERE transaction_id = %s"
                execute_query(bank_ledger_delete_query, (transaction_id,), fetch=False)
                logger.info(f"[BANK_LEDGER] Deleted associated bank ledger entry for vendor payment ID: {ledger_id}, transaction: {transaction_id}")

            # Delete from vendor_payments
            delete_query = "DELETE FROM vendor_payments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_LEDGER] Deleted vendor payment entry ID: {ledger_id}")
            return jsonify({
                "status": "success",
                "message": f"Vendor payment entry ID {ledger_id} deleted successfully"
            }), 200

        # Check if this is a vendor adjustment entry
        adjustment_query = """
            SELECT id, vendor_id, company_id
            FROM vendor_adjustments
            WHERE id = %s
        """
        adjustment_results = execute_query(adjustment_query, (ledger_id,))

        if adjustment_results and len(adjustment_results) > 0:
            # Delete from vendor_adjustments
            delete_query = "DELETE FROM vendor_adjustments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_LEDGER] Deleted vendor adjustment entry ID: {ledger_id}")
            return jsonify({
                "status": "success",
                "message": f"Vendor adjustment entry ID {ledger_id} deleted successfully"
            }), 200

        # If none found, return not found
        return jsonify({
            "error": "Entry not found",
            "message": f"No vendor ledger entry found with ID: {ledger_id}",
            "status": "not_found"
        }), 404

    except Exception as e:
        logger.error(f"[VENDOR_LEDGER] Failed to delete vendor ledger entry ID {ledger_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete vendor ledger entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/expense-ledger', methods=['GET'])
def get_expense_ledger():
    """Get expense ledger data from expense_ledger table with filtering and pagination"""
    try:
        # Get query parameters
        company_id = request.args.get('company_id', '').strip()
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        expense_type = request.args.get('expense_type', '').strip()
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        if not company_id:
            return jsonify({
                "error": "Company ID is required",
                "message": "Please provide a company_id parameter",
                "status": "validation_error"
            }), 400

        logger.info(f"[EXPENSE_LEDGER] Fetching ledger data for company ID: {company_id}")

        # Ensure expense_ledger table exists
        create_expense_ledger_query = """
            CREATE TABLE IF NOT EXISTS expense_ledger (
                id SERIAL PRIMARY KEY,
                transaction_id VARCHAR(100) NOT NULL,
                expense_type VARCHAR(100) NOT NULL,
                company VARCHAR(255) NOT NULL,
                vendor_name VARCHAR(255) NOT NULL,
                vendor_gst_number VARCHAR(15),
                amount DECIMAL(15,2) NOT NULL,
                expense_date DATE NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                description TEXT,
                particulars TEXT,
                debit DECIMAL(15,2) DEFAULT 0,
                credit DECIMAL(15,2) DEFAULT 0,
                account_type VARCHAR(50) NOT NULL,
                company_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_expense_ledger_query, fetch=False)

        # Create indexes if they don't exist
        index_queries = [
            "CREATE INDEX IF NOT EXISTS idx_expense_ledger_transaction_id ON expense_ledger(transaction_id)",
            "CREATE INDEX IF NOT EXISTS idx_expense_ledger_expense_date ON expense_ledger(expense_date)",
            "CREATE INDEX IF NOT EXISTS idx_expense_ledger_company ON expense_ledger(company)",
            "CREATE INDEX IF NOT EXISTS idx_expense_ledger_expense_type ON expense_ledger(expense_type)",
            "CREATE INDEX IF NOT EXISTS idx_expense_ledger_account_type ON expense_ledger(account_type)"
        ]
        for index_query in index_queries:
            try:
                execute_query(index_query, fetch=False)
            except Exception as idx_e:
                logger.warning(f"[EXPENSE_LEDGER] Could not create index: {idx_e}")

        # Build query for expense_ledger entries
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
            WHERE company_id = %s
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

        query += " ORDER BY expense_date DESC, created_at DESC"

        # Get total count first
        count_query = f"SELECT COUNT(*) as total FROM ({query}) as subquery"
        count_result = execute_query(count_query, params)
        total_entries = count_result[0]['total'] if count_result else 0

        # Apply pagination
        paginated_query = query + " LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        ledger_results = execute_query(paginated_query, params)

        entries = []
        total_debit = 0
        total_credit = 0

        if ledger_results:
            logger.info(f"[EXPENSE_LEDGER] Found {len(ledger_results)} entries for company ID: {company_id}")
            for row in ledger_results:
                debit_amount = float(row['debit']) if row['debit'] else 0
                credit_amount = float(row['credit']) if row['credit'] else 0
                entries.append({
                    'id': row['id'],
                    'expense_date': str(row['expense_date']) if row['expense_date'] else None,
                    'expense_type': row['expense_type'] or '',
                    'vendor_name': row['vendor_name'] or '',
                    'particulars': row['particulars'] or row['description'] or '',
                    'transaction_id': row['transaction_id'] or '',
                    'debit': debit_amount,
                    'credit': credit_amount,
                    'payment_method': row['payment_method'] or '',
                    'amount': float(row['amount']) if row['amount'] else 0
                })
                total_debit += debit_amount
                total_credit += credit_amount
        else:
            logger.info(f"[EXPENSE_LEDGER] No entries found in expense_ledger for company ID: {company_id}")

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

        logger.info(f"[EXPENSE_LEDGER] Returning {len(entries)} paginated entries for company ID: {company_id}")

        return jsonify({
            "status": "success",
            "data": {
                "entries": entries,
                "summary": summary,
                "total_entries": total_entries,
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + limit) < total_entries
                }
            },
            "message": f"Retrieved {len(entries)} expense ledger entries for company ID: {company_id}",
            "total": len(entries)
        }), 200

    except Exception as e:
        logger.error(f"[EXPENSE_LEDGER] Failed to retrieve expense ledger for company ID {company_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve expense ledger data",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/bank-ledger-report', methods=['GET'])
def get_bank_ledger_report():
    """Get bank ledger report data from bank_ledger table with filtering and pagination"""
    try:
        # Get query parameters
        company_id = request.args.get('company_id', '').strip()
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        if not company_id:
            return jsonify({
                "error": "Company ID is required",
                "message": "Please provide a company_id parameter",
                "status": "validation_error"
            }), 400

        logger.info(f"[BANK_LEDGER_REPORT] Fetching ledger data for company ID: {company_id}")

        # Ensure bank_ledger table exists
        create_bank_ledger_query = """
            CREATE TABLE IF NOT EXISTS bank_ledger (
                id SERIAL PRIMARY KEY,
                payment_date DATE NOT NULL,
                transaction_id VARCHAR(100),
                vendor_id INTEGER,
                company_id INTEGER REFERENCES company_details(id),
                vendor_name VARCHAR(255),
                amount DECIMAL(15,2) NOT NULL,
                remark TEXT,
                transaction_type VARCHAR(20) DEFAULT 'payment',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        execute_query(create_bank_ledger_query, fetch=False)

        # Create indexes if they don't exist
        index_queries = [
            "CREATE INDEX IF NOT EXISTS idx_bank_ledger_company_id ON bank_ledger(company_id)",
            "CREATE INDEX IF NOT EXISTS idx_bank_ledger_payment_date ON bank_ledger(payment_date)",
            "CREATE INDEX IF NOT EXISTS idx_bank_ledger_transaction_id ON bank_ledger(transaction_id)"
        ]
        for index_query in index_queries:
            try:
                execute_query(index_query, fetch=False)
            except Exception as idx_e:
                logger.warning(f"[BANK_LEDGER_REPORT] Could not create index: {idx_e}")

        # Build query for bank_ledger entries with running balance
        query = """
            SELECT
                id,
                payment_date,
                transaction_id,
                vendor_name,
                amount,
                remark,
                transaction_type,
                created_at
            FROM bank_ledger
            WHERE company_id = %s
        """
        params = [company_id]

        if start_date:
            query += " AND payment_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND payment_date <= %s"
            params.append(end_date)

        query += " ORDER BY payment_date DESC, created_at DESC"

        # Get total count first
        count_query = f"SELECT COUNT(*) as total FROM ({query}) as subquery"
        count_result = execute_query(count_query, params)
        total_entries = count_result[0]['total'] if count_result else 0

        # Apply pagination
        paginated_query = query + " LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        ledger_results = execute_query(paginated_query, params)

        entries = []
        if ledger_results:
            logger.info(f"[BANK_LEDGER_REPORT] Found {len(ledger_results)} entries for company ID: {company_id}")

            # Calculate running balance
            running_balance = 0
            for row in ledger_results:
                # For bank ledger: receipts are debits (money in), payments are credits (money out)
                if row['transaction_type'] == 'receipt':
                    dr = float(row['amount']) if row['amount'] else 0
                    cr = 0
                    running_balance += dr
                else:  # payment
                    dr = 0
                    cr = float(row['amount']) if row['amount'] else 0
                    running_balance -= cr

                entries.append({
                    'id': row['id'],
                    'entry_date': str(row['payment_date']) if row['payment_date'] else None,
                    'particulars': row['remark'] or f"{row['transaction_type'].title()} - {row['vendor_name'] or 'N/A'}",
                    'transaction_id': row['transaction_id'] or '',
                    'dr': dr,
                    'cr': cr,
                    'balance': running_balance
                })
        else:
            logger.info(f"[BANK_LEDGER_REPORT] No entries found in bank_ledger for company ID: {company_id}")

        logger.info(f"[BANK_LEDGER_REPORT] Returning {len(entries)} paginated entries for company ID: {company_id}")

        return jsonify({
            "status": "success",
            "data": entries,
            "message": f"Retrieved {len(entries)} bank ledger entries for company ID: {company_id}",
            "total": len(entries)
        }), 200

    except Exception as e:
        logger.error(f"[BANK_LEDGER_REPORT] Failed to retrieve bank ledger report for company ID {company_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve bank ledger report data",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/company-ledger/<int:ledger_id>', methods=['DELETE'])
def delete_company_ledger_entry(ledger_id):
    """Delete a company ledger entry or adjustment entry based on the source table"""
    try:
        # First, check if this is a regular ClientLedger entry
        select_query = """
            SELECT id, voucher_no, company_name, entry_type
            FROM ClientLedger
            WHERE id = %s
        """
        ledger_results = execute_query(select_query, (ledger_id,))

        if ledger_results and len(ledger_results) > 0:
            # Delete from ClientLedger
            delete_query = "DELETE FROM ClientLedger WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[LEDGER] Deleted ClientLedger entry ID: {ledger_id}")
            return jsonify({
                "status": "success",
                "message": f"ClientLedger entry ID {ledger_id} deleted successfully"
            }), 200

        # Check if this is a client adjustment entry
        client_adjustment_query = """
            SELECT id, company_id, customer_id
            FROM client_adjustments
            WHERE id = %s
        """
        client_results = execute_query(client_adjustment_query, (ledger_id,))

        if client_results and len(client_results) > 0:
            # Delete from client_adjustments
            delete_query = "DELETE FROM client_adjustments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[CLIENT_ADJUSTMENT] Deleted client adjustment entry ID: {ledger_id}")
            return jsonify({
                "status": "success",
                "message": f"Client adjustment entry ID {ledger_id} deleted successfully"
            }), 200

        # Check if this is a vendor adjustment entry
        vendor_adjustment_query = """
            SELECT id, company_id, vendor_id
            FROM vendor_adjustments
            WHERE id = %s
        """
        vendor_results = execute_query(vendor_adjustment_query, (ledger_id,))

        if vendor_results and len(vendor_results) > 0:
            # Delete from vendor_adjustments
            delete_query = "DELETE FROM vendor_adjustments WHERE id = %s"
            execute_query(delete_query, (ledger_id,), fetch=False)

            logger.info(f"[VENDOR_ADJUSTMENT] Deleted vendor adjustment entry ID: {ledger_id}")
            return jsonify({
                "status": "success",
                "message": f"Vendor adjustment entry ID {ledger_id} deleted successfully"
            }), 200

        # If none found, return not found
        return jsonify({
            "error": "Entry not found",
            "message": f"No ledger or adjustment entry found with ID: {ledger_id}",
            "status": "not_found"
        }), 404

    except Exception as e:
        logger.error(f"[LEDGER] Failed to delete ledger entry ID {ledger_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete ledger entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/adjustments', methods=['POST'])
def create_adjustment():
    """Create a new adjustment entry (client or vendor based on adjustment_type)"""
    try:
        data = request.get_json()

        # Check adjustment type
        adjustment_type = data.get('adjustment_type', 'client')

        if adjustment_type == 'client':
            required_fields = ['company_id', 'customer_id', 'date_of_service', 'particular_of_service', 'adjustment_amount']
            table_name = 'client_adjustments'
            insert_fields = 'company_id, customer_id, date_of_service, particular_of_service, adjustment_amount, on_account_of, remark'
            params = (
                data['company_id'],
                data['customer_id'],
                data['date_of_service'],
                data['particular_of_service'],
                data['adjustment_amount'],
                data.get('on_account_of'),
                data.get('remark')
            )
        elif adjustment_type == 'vendor':
            required_fields = ['company_id', 'vendor_id', 'date_of_service', 'particular_of_service', 'adjustment_amount']
            table_name = 'vendor_adjustments'
            insert_fields = 'company_id, vendor_id, date_of_service, particular_of_service, adjustment_amount, on_account_of, remark'
            params = (
                data['company_id'],
                data['vendor_id'],
                data['date_of_service'],
                data['particular_of_service'],
                data['adjustment_amount'],
                data.get('on_account_of'),
                data.get('remark')
            )
        else:
            return jsonify({
                "error": "Invalid adjustment type",
                "message": "adjustment_type must be either 'client' or 'vendor'",
                "status": "validation_error"
            }), 400

        # Validate required fields
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate adjustment_amount is not zero
        if data['adjustment_amount'] == 0:
            return jsonify({
                "error": "Invalid adjustment amount",
                "message": "Adjustment amount cannot be zero",
                "status": "validation_error"
            }), 400

        query = f"""
            INSERT INTO {table_name} (
                {insert_fields}
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        result = execute_query(query, params)

        if result:
            adjustment_id = result[0]['id']
            logger.info(f"[{adjustment_type.upper()}_ADJUSTMENT] Created {adjustment_type} adjustment entry ID: {adjustment_id}")

            # Generate and save adjustment invoice PDF to database
            try:
                # Generate the adjustment invoice PDF
                pdf_base64 = generate_adjustment_invoice_pdf(data, adjustment_id)

                if pdf_base64:
                    # Save to invoice_images table
                    invoice_no = f"ADJ-{adjustment_id}"
                    save_response = save_invoice_image_helper({
                        'invoice_no': invoice_no,
                        'image_data': pdf_base64,
                        'image_type': 'pdf',
                        'file_name': f"{adjustment_type.title()}_Adjustment_{invoice_no}.pdf",
                        'voucher_type': 'Adjustment'
                    })

                    if save_response.get('status') != 'success':
                        logger.warning(f"[ADJUSTMENT_INVOICE] Failed to save adjustment invoice for ID: {adjustment_id}: {save_response}")
                else:
                    logger.warning(f"[ADJUSTMENT_INVOICE] Failed to generate PDF for adjustment ID: {adjustment_id}")

            except Exception as pdf_e:
                logger.error(f"[ADJUSTMENT_INVOICE] Failed to generate/save adjustment invoice PDF for ID {adjustment_id}: {pdf_e}")
                # Don't fail adjustment creation if PDF generation fails

            return jsonify({
                "status": "success",
                "data": {"adjustment_id": adjustment_id},
                "message": f"{adjustment_type.title()} adjustment entry created successfully with ID: {adjustment_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create record",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[ADJUSTMENT] Failed to create adjustment: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create adjustment entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-client-adjustment/<int:adjustment_id>', methods=['GET'])
def get_client_adjustment(adjustment_id):
    """Get a specific client adjustment entry by ID"""
    try:
        query = """
            SELECT
                ca.id,
                ca.company_id,
                ca.customer_id,
                ca.date_of_service,
                ca.particular_of_service,
                ca.adjustment_amount,
                ca.on_account_of,
                ca.remark,
                ca.created_at,
                cd.company_name,
                cd.company_gst_number as company_gst,
                cd.company_address,
                NULL as company_state_code,
                b2b.company_name as customer_name,
                b2b.gst_number as customer_gst,
                b2b.address as customer_address,
                b2b.state_code as customer_state_code
            FROM client_adjustments ca
            JOIN company_details cd ON ca.company_id = cd.id
            JOIN b2bcustomersdetails b2b ON ca.customer_id = b2b.id
            WHERE ca.id = %s
        """

        results = execute_query(query, (adjustment_id,))

        if results and len(results) > 0:
            adjustment = results[0]
            adjustment_data = {
                'id': adjustment['id'],
                'company_id': adjustment['company_id'],
                'customer_id': adjustment['customer_id'],
                'date_of_service': str(adjustment['date_of_service']) if adjustment['date_of_service'] else None,
                'particular_of_service': adjustment['particular_of_service'],
                'adjustment_amount': float(adjustment['adjustment_amount']) if adjustment['adjustment_amount'] else 0,
                'on_account_of': adjustment['on_account_of'],
                'remark': adjustment['remark'],
                'created_at': str(adjustment['created_at']),
                'company_name': adjustment['company_name'],
                'company_gst': adjustment['company_gst'],
                'company_address': adjustment['company_address'],
                'company_state_code': adjustment['company_state_code'],
                'customer_name': adjustment['customer_name'],
                'customer_gst': adjustment['customer_gst'],
                'customer_address': adjustment['customer_address'],
                'customer_state_code': adjustment['customer_state_code']
            }

            logger.info(f"[CLIENT_ADJUSTMENT] Retrieved client adjustment ID: {adjustment_id}")
            return jsonify({
                "status": "success",
                "data": adjustment_data,
                "message": f"Retrieved client adjustment ID: {adjustment_id}"
            }), 200
        else:
            return jsonify({
                "error": "Client adjustment not found",
                "message": f"No client adjustment found with ID: {adjustment_id}",
                "status": "not_found"
            }), 404

    except Exception as e:
        logger.error(f"[CLIENT_ADJUSTMENT] Failed to retrieve client adjustment ID {adjustment_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve client adjustment",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-vendor-adjustment/<int:adjustment_id>', methods=['GET'])
def get_vendor_adjustment(adjustment_id):
    """Get a specific vendor adjustment entry by ID"""
    try:
        query = """
            SELECT
                va.id,
                va.company_id,
                va.vendor_id,
                va.date_of_service,
                va.particular_of_service,
                va.adjustment_amount,
                va.on_account_of,
                va.remark,
                va.created_at,
                cd.company_name,
                cd.company_gst_number as company_gst,
                cd.company_address,
                NULL as company_state_code,
                v.vendor_name,
                v.gst_number as vendor_gst,
                v.address as vendor_address,
                v.state as vendor_state_code
            FROM vendor_adjustments va
            JOIN company_details cd ON va.company_id = cd.id
            JOIN vendors v ON va.vendor_id = v.id
            WHERE va.id = %s
        """

        results = execute_query(query, (adjustment_id,))

        if results and len(results) > 0:
            adjustment = results[0]
            adjustment_data = {
                'id': adjustment['id'],
                'company_id': adjustment['company_id'],
                'vendor_id': adjustment['vendor_id'],
                'date_of_service': str(adjustment['date_of_service']) if adjustment['date_of_service'] else None,
                'particular_of_service': adjustment['particular_of_service'],
                'adjustment_amount': float(adjustment['adjustment_amount']) if adjustment['adjustment_amount'] else 0,
                'on_account_of': adjustment['on_account_of'],
                'remark': adjustment['remark'],
                'created_at': str(adjustment['created_at']),
                'company_name': adjustment['company_name'],
                'company_gst': adjustment['company_gst'],
                'company_address': adjustment['company_address'],
                'company_state_code': adjustment['company_state_code'],
                'vendor_name': adjustment['vendor_name'],
                'vendor_gst': adjustment['vendor_gst'],
                'vendor_address': adjustment['vendor_address'],
                'vendor_state_code': adjustment['vendor_state_code']
            }

            logger.info(f"[VENDOR_ADJUSTMENT] Retrieved vendor adjustment ID: {adjustment_id}")
            return jsonify({
                "status": "success",
                "data": adjustment_data,
                "message": f"Retrieved vendor adjustment ID: {adjustment_id}"
            }), 200
        else:
            return jsonify({
                "error": "Vendor adjustment not found",
                "message": f"No vendor adjustment found with ID: {adjustment_id}",
                "status": "not_found"
            }), 404

    except Exception as e:
        logger.error(f"[VENDOR_ADJUSTMENT] Failed to retrieve vendor adjustment ID {adjustment_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendor adjustment",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/client-adjustments', methods=['POST'])
def create_client_adjustment():
    """Create a new client adjustment entry"""
    try:
        data = request.get_json()

        required_fields = ['company_id', 'customer_id', 'date_of_service', 'particular_of_service', 'adjustment_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate adjustment_amount is not zero
        if data['adjustment_amount'] == 0:
            return jsonify({
                "error": "Invalid adjustment amount",
                "message": "Adjustment amount cannot be zero",
                "status": "validation_error"
            }), 400

        query = """
            INSERT INTO client_adjustments (
                company_id, customer_id, date_of_service, particular_of_service,
                adjustment_amount, on_account_of, remark
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        result = execute_query(query, (
            data['company_id'],
            data['customer_id'],
            data['date_of_service'],
            data['particular_of_service'],
            data['adjustment_amount'],
            data.get('on_account_of'),
            data.get('remark')
        ))

        if result:
            adjustment_id = result[0]['id']
            logger.info(f"[CLIENT_ADJUSTMENT] Created client adjustment entry ID: {adjustment_id}")

            # Generate and save adjustment invoice PDF to database
            try:
                # Generate the adjustment invoice PDF
                pdf_base64 = generate_adjustment_invoice_pdf(data, adjustment_id)

                if pdf_base64:
                    # Save to invoice_images table
                    invoice_no = f"ADJ-{adjustment_id}"
                    save_response = save_invoice_image_helper({
                        'invoice_no': invoice_no,
                        'image_data': pdf_base64,
                        'image_type': 'pdf',
                        'file_name': f"Client_Adjustment_{invoice_no}.pdf",
                        'voucher_type': 'Adjustment'
                    })

                    if save_response.get('status') != 'success':
                        logger.warning(f"[ADJUSTMENT_INVOICE] Failed to save adjustment invoice for ID: {adjustment_id}: {save_response}")
                else:
                    logger.warning(f"[ADJUSTMENT_INVOICE] Failed to generate PDF for adjustment ID: {adjustment_id}")

            except Exception as pdf_e:
                logger.error(f"[ADJUSTMENT_INVOICE] Failed to generate/save adjustment invoice PDF for ID {adjustment_id}: {pdf_e}")
                # Don't fail adjustment creation if PDF generation fails

            return jsonify({
                "status": "success",
                "data": {"adjustment_id": adjustment_id},
                "message": f"Client adjustment entry created successfully with ID: {adjustment_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create record",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[CLIENT_ADJUSTMENT] Failed to create client adjustment: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create client adjustment entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/client-adjustments', methods=['GET'])
def get_client_adjustments():
    """Get client adjustment entries with optional filtering"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        query = """
            SELECT
                ca.id,
                ca.company_id,
                ca.customer_id,
                ca.date_of_service,
                ca.particular_of_service,
                ca.adjustment_amount,
                ca.on_account_of,
                ca.remark,
                ca.created_at,
                cd.company_name,
                cd.company_gst_number as company_gst,
                cd.company_address,
                NULL as company_state_code,
                b2b.company_name as customer_name,
                b2b.gst_number as customer_gst,
                b2b.address as customer_address,
                b2b.state_code as customer_state_code
            FROM client_adjustments ca
            JOIN company_details cd ON ca.company_id = cd.id
            JOIN b2bcustomersdetails b2b ON ca.customer_id = b2b.id
            ORDER BY ca.created_at DESC
            LIMIT %s OFFSET %s
        """
        params = (limit, offset)

        results = execute_query(query, params)

        if results:
            adjustments = []
            for row in results:
                adjustments.append({
                    'id': row['id'],
                    'company_id': row['company_id'],
                    'customer_id': row['customer_id'],
                    'date_of_service': str(row['date_of_service']) if row['date_of_service'] else None,
                    'particular_of_service': row['particular_of_service'],
                    'adjustment_amount': float(row['adjustment_amount']) if row['adjustment_amount'] else 0,
                    'on_account_of': row['on_account_of'],
                    'remark': row['remark'],
                    'created_at': str(row['created_at']),
                    'company_name': row['company_name'],
                    'company_gst': row['company_gst'],
                    'company_address': row['company_address'],
                    'company_state_code': row['company_state_code'],
                    'customer_name': row['customer_name'],
                    'customer_gst': row['customer_gst'],
                    'customer_address': row['customer_address'],
                    'customer_state_code': row['customer_state_code']
                })

            logger.info(f"[CLIENT_ADJUSTMENT] Retrieved {len(adjustments)} client adjustment entries")
            return jsonify({
                "status": "success",
                "data": adjustments,
                "message": f"Retrieved {len(adjustments)} client adjustment entries successfully",
                "total": len(adjustments)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No client adjustment entries found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[CLIENT_ADJUSTMENT] Failed to retrieve client adjustments: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve client adjustment entries",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/client-adjustments/<int:adjustment_id>', methods=['GET'])
def get_client_adjustment_by_id(adjustment_id):
    """Get a specific client adjustment entry by ID"""
    try:
        query = """
            SELECT
                ca.id,
                ca.company_id,
                ca.customer_id,
                ca.date_of_service,
                ca.particular_of_service,
                ca.adjustment_amount,
                ca.on_account_of,
                ca.remark,
                ca.created_at,
                cd.company_name,
                cd.company_gst_number as company_gst,
                cd.company_address,
                NULL as company_state_code,
                b2b.company_name as customer_name,
                b2b.gst_number as customer_gst,
                b2b.address as customer_address,
                b2b.state_code as customer_state_code
            FROM client_adjustments ca
            JOIN company_details cd ON ca.company_id = cd.id
            JOIN b2bcustomersdetails b2b ON ca.customer_id = b2b.id
            WHERE ca.id = %s
        """

        results = execute_query(query, (adjustment_id,))

        if results and len(results) > 0:
            adjustment = results[0]
            adjustment_data = {
                'id': adjustment['id'],
                'company_id': adjustment['company_id'],
                'customer_id': adjustment['customer_id'],
                'date_of_service': str(adjustment['date_of_service']) if adjustment['date_of_service'] else None,
                'particular_of_service': adjustment['particular_of_service'],
                'adjustment_amount': float(adjustment['adjustment_amount']) if adjustment['adjustment_amount'] else 0,
                'on_account_of': adjustment['on_account_of'],
                'remark': adjustment['remark'],
                'created_at': str(adjustment['created_at']),
                'company_name': adjustment['company_name'],
                'company_gst': adjustment['company_gst'],
                'company_address': adjustment['company_address'],
                'company_state_code': adjustment['company_state_code'],
                'customer_name': adjustment['customer_name'],
                'customer_gst': adjustment['customer_gst'],
                'customer_address': adjustment['customer_address'],
                'customer_state_code': adjustment['customer_state_code']
            }

            logger.info(f"[CLIENT_ADJUSTMENT] Retrieved client adjustment ID: {adjustment_id}")
            return jsonify({
                "status": "success",
                "data": adjustment_data,
                "message": f"Retrieved client adjustment ID: {adjustment_id}"
            }), 200
        else:
            return jsonify({
                "error": "Client adjustment not found",
                "message": f"No client adjustment found with ID: {adjustment_id}",
                "status": "not_found"
            }), 404

    except Exception as e:
        logger.error(f"[CLIENT_ADJUSTMENT] Failed to retrieve client adjustment ID {adjustment_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve client adjustment",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-adjustments', methods=['POST'])
def create_vendor_adjustment():
    """Create a new vendor adjustment entry"""
    try:
        data = request.get_json()

        required_fields = ['company_id', 'vendor_id', 'date_of_service', 'particular_of_service', 'adjustment_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate adjustment_amount is not zero
        if data['adjustment_amount'] == 0:
            return jsonify({
                "error": "Invalid adjustment amount",
                "message": "Adjustment amount cannot be zero",
                "status": "validation_error"
            }), 400

        query = """
            INSERT INTO vendor_adjustments (
                company_id, vendor_id, date_of_service, particular_of_service,
                adjustment_amount, on_account_of, remark
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        result = execute_query(query, (
            data['company_id'],
            data['vendor_id'],
            data['date_of_service'],
            data['particular_of_service'],
            data['adjustment_amount'],
            data.get('on_account_of'),
            data.get('remark')
        ))

        if result:
            adjustment_id = result[0]['id']
            logger.info(f"[VENDOR_ADJUSTMENT] Created vendor adjustment entry ID: {adjustment_id}")

            # Generate and save adjustment invoice PDF to database
            try:
                # Generate the adjustment invoice PDF
                pdf_base64 = generate_adjustment_invoice_pdf(data, adjustment_id)

                if pdf_base64:
                    # Save to invoice_images table
                    invoice_no = f"ADJ-{adjustment_id}"
                    save_response = save_invoice_image_helper({
                        'invoice_no': invoice_no,
                        'image_data': pdf_base64,
                        'image_type': 'pdf',
                        'file_name': f"Vendor_Adjustment_{invoice_no}.pdf",
                        'voucher_type': 'Adjustment'
                    })

                    if save_response.get('status') != 'success':
                        logger.warning(f"[ADJUSTMENT_INVOICE] Failed to save adjustment invoice for ID: {adjustment_id}: {save_response}")
                else:
                    logger.warning(f"[ADJUSTMENT_INVOICE] Failed to generate PDF for adjustment ID: {adjustment_id}")

            except Exception as pdf_e:
                logger.error(f"[ADJUSTMENT_INVOICE] Failed to generate/save adjustment invoice PDF for ID {adjustment_id}: {pdf_e}")
                # Don't fail adjustment creation if PDF generation fails

            return jsonify({
                "status": "success",
                "data": {"adjustment_id": adjustment_id},
                "message": f"Vendor adjustment entry created successfully with ID: {adjustment_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create record",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[VENDOR_ADJUSTMENT] Failed to create vendor adjustment: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create vendor adjustment entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-adjustments', methods=['GET'])
def get_vendor_adjustments():
    """Get vendor adjustment entries with optional filtering"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        query = """
            SELECT
                va.id,
                va.company_id,
                va.vendor_id,
                va.date_of_service,
                va.particular_of_service,
                va.adjustment_amount,
                va.on_account_of,
                va.remark,
                va.created_at,
                cd.company_name,
                cd.company_gst_number as company_gst,
                cd.company_address,
                NULL as company_state_code,
                v.vendor_name,
                v.gst_number as vendor_gst,
                v.address as vendor_address,
                v.state as vendor_state_code
            FROM vendor_adjustments va
            JOIN company_details cd ON va.company_id = cd.id
            JOIN vendors v ON va.vendor_id = v.id
            ORDER BY va.created_at DESC
            LIMIT %s OFFSET %s
        """
        params = (limit, offset)

        results = execute_query(query, params)

        if results:
            adjustments = []
            for row in results:
                adjustments.append({
                    'id': row['id'],
                    'company_id': row['company_id'],
                    'vendor_id': row['vendor_id'],
                    'date_of_service': str(row['date_of_service']) if row['date_of_service'] else None,
                    'particular_of_service': row['particular_of_service'],
                    'adjustment_amount': float(row['adjustment_amount']) if row['adjustment_amount'] else 0,
                    'on_account_of': row['on_account_of'],
                    'remark': row['remark'],
                    'created_at': str(row['created_at']),
                    'company_name': row['company_name'],
                    'company_gst': row['company_gst'],
                    'company_address': row['company_address'],
                    'company_state_code': row['company_state_code'],
                    'vendor_name': row['vendor_name'],
                    'vendor_gst': row['vendor_gst'],
                    'vendor_address': row['vendor_address'],
                    'vendor_state_code': row['vendor_state_code']
                })

            logger.info(f"[VENDOR_ADJUSTMENT] Retrieved {len(adjustments)} vendor adjustment entries")
            return jsonify({
                "status": "success",
                "data": adjustments,
                "message": f"Retrieved {len(adjustments)} vendor adjustment entries successfully",
                "total": len(adjustments)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No vendor adjustment entries found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[VENDOR_ADJUSTMENT] Failed to retrieve vendor adjustments: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendor adjustment entries",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-adjustments/<int:adjustment_id>', methods=['GET'])
def get_vendor_adjustment_by_id(adjustment_id):
    """Get a specific vendor adjustment entry by ID"""
    try:
        query = """
            SELECT
                va.id,
                va.company_id,
                va.vendor_id,
                va.date_of_service,
                va.particular_of_service,
                va.adjustment_amount,
                va.on_account_of,
                va.remark,
                va.created_at,
                cd.company_name,
                cd.company_gst_number as company_gst,
                cd.company_address,
                NULL as company_state_code,
                v.vendor_name,
                v.gst_number as vendor_gst,
                v.address as vendor_address,
                v.state as vendor_state_code
            FROM vendor_adjustments va
            JOIN company_details cd ON va.company_id = cd.id
            JOIN vendors v ON va.vendor_id = v.id
            WHERE va.id = %s
        """

        results = execute_query(query, (adjustment_id,))

        if results and len(results) > 0:
            adjustment = results[0]
            adjustment_data = {
                'id': adjustment['id'],
                'company_id': adjustment['company_id'],
                'vendor_id': adjustment['vendor_id'],
                'date_of_service': str(adjustment['date_of_service']) if adjustment['date_of_service'] else None,
                'particular_of_service': adjustment['particular_of_service'],
                'adjustment_amount': float(adjustment['adjustment_amount']) if adjustment['adjustment_amount'] else 0,
                'on_account_of': adjustment['on_account_of'],
                'remark': adjustment['remark'],
                'created_at': str(adjustment['created_at']),
                'company_name': adjustment['company_name'],
                'company_gst': adjustment['company_gst'],
                'company_address': adjustment['company_address'],
                'company_state_code': adjustment['company_state_code'],
                'vendor_name': adjustment['vendor_name'],
                'vendor_gst': adjustment['vendor_gst'],
                'vendor_address': adjustment['vendor_address'],
                'vendor_state_code': adjustment['vendor_state_code']
            }

            logger.info(f"[VENDOR_ADJUSTMENT] Retrieved vendor adjustment ID: {adjustment_id}")
            return jsonify({
                "status": "success",
                "data": adjustment_data,
                "message": f"Retrieved vendor adjustment ID: {adjustment_id}"
            }), 200
        else:
            return jsonify({
                "error": "Vendor adjustment not found",
                "message": f"No vendor adjustment found with ID: {adjustment_id}",
                "status": "not_found"
            }), 404

    except Exception as e:
        logger.error(f"[VENDOR_ADJUSTMENT] Failed to retrieve vendor adjustment ID {adjustment_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendor adjustment",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/generate-invoice-number', methods=['GET'])
def generate_invoice_number():
    """Generate the next sequential invoice number in format AMA/FY-25-26/XXXX"""
    try:
        # Get the highest existing invoice number for the current fiscal year
        fiscal_year_prefix = "AMA/FY-25-26/"

        query = """
            SELECT invoice_no
            FROM ReceiptInvoiceData
            WHERE invoice_no LIKE %s
            ORDER BY invoice_no DESC
            LIMIT 1
        """

        results = execute_query(query, (f"{fiscal_year_prefix}%",))

        next_number = 1  # Default starting number

        if results and len(results) > 0:
            last_invoice = results[0]['invoice_no']
            # Extract the sequential number from the end
            try:
                sequential_part = last_invoice.split('/')[-1]  # Get the last part after /
                current_number = int(sequential_part)
                next_number = current_number + 1
            except (ValueError, IndexError):
                # If parsing fails, start from 1
                next_number = 1

        # Format the invoice number with zero-padded 4-digit number
        invoice_number = f"{fiscal_year_prefix}{next_number:04d}"

        logger.info(f"[INVOICE_NUMBER] Generated next invoice number: {invoice_number}")
        return jsonify({
            "status": "success",
            "data": {"invoice_number": invoice_number},
            "message": f"Generated invoice number: {invoice_number}"
        }), 200

    except Exception as e:
        logger.error(f"[INVOICE_NUMBER] Failed to generate invoice number: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to generate invoice number",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-vendor-details/<int:vendor_id>', methods=['GET'])
def get_vendor_details(vendor_id):
    """Get vendor details by ID for adjustment invoices"""
    try:
        query = """
            SELECT
                id,
                vendor_name,
                gst_number,
                vendor_address,
                state_code,
                contact_person,
                phone_number,
                email
            FROM vendors
            WHERE id = %s
        """

        results = execute_query(query, (vendor_id,))

        if results and len(results) > 0:
            vendor = results[0]
            vendor_data = {
                'id': vendor['id'],
                'vendor_name': vendor['vendor_name'],
                'gst_number': vendor['gst_number'],
                'vendor_address': vendor['vendor_address'] or '',
                'state_code': vendor['state_code'],
                'contact_person': vendor['contact_person'],
                'phone_number': vendor['phone_number'],
                'email': vendor['email']
            }

            logger.info(f"[VENDOR] Retrieved vendor details for ID: {vendor_id}")
            return jsonify({
                "status": "success",
                "data": vendor_data,
                "message": f"Retrieved vendor details for ID: {vendor_id}"
            }), 200
        else:
            return jsonify({
                "error": "Vendor not found",
                "message": f"No vendor found with ID: {vendor_id}",
                "status": "not_found"
            }), 404

    except Exception as e:
        logger.error(f"[VENDOR] Failed to retrieve vendor details ID {vendor_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendor details",
            "status": "error"
        }), 500

def generate_receipt_invoice_pdf(receipt_data, receipt_id):
    """Generate a receipt invoice PDF that exactly matches the frontend ReceiptInvoicePreview.jsx layout"""
    try:
        logger.info(f"[RECEIPT_INVOICE] Starting PDF generation for receipt ID: {receipt_id}")

        # Import required modules for PDF generation
        import base64
        from io import BytesIO
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch

        # Get receipt details from the data passed
        company_name = receipt_data.get('company_name', 'Company Name')
        customer_name = receipt_data.get('customer_name', 'Customer Name')
        transaction_date = str(receipt_data.get('transaction_date', ''))
        payment_type = receipt_data.get('payment_type', '')
        amount_received = float(receipt_data.get('amount_received', 0))
        transaction_id = receipt_data.get('transaction_id', '-')
        on_account_of = receipt_data.get('on_account_of', '-')
        remark = receipt_data.get('remark', '-')

        logger.info(f"[RECEIPT_INVOICE] Receipt details - company: {company_name}, customer: {customer_name}, amount: {amount_received}")

        # Fetch additional company and customer details from database
        company_data = {}
        customer_data = {}

        try:
            # Get company details
            if receipt_data.get('company_name'):
                company_query = "SELECT company_name, company_gst_number, company_address FROM company_details WHERE company_name = %s LIMIT 1"
                company_result = execute_query(company_query, (receipt_data.get('company_name'),))
                if company_result:
                    company_data = company_result[0]
                    logger.info(f"[RECEIPT_INVOICE] Company data: {company_data}")

            # Get customer details
            if receipt_data.get('customer_name'):
                customer_query = "SELECT company_name, gst_number, address, state_code FROM b2bcustomersdetails WHERE company_name = %s LIMIT 1"
                customer_result = execute_query(customer_query, (receipt_data.get('customer_name'),))
                if customer_result:
                    customer_data = customer_result[0]
                    logger.info(f"[RECEIPT_INVOICE] Customer data: {customer_data}")

        except Exception as db_e:
            logger.warning(f"[RECEIPT_INVOICE] Could not fetch company/customer details: {db_e}")

        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()

        # Create custom styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=30,  # text-3xl equivalent
            spaceAfter=30,
            alignment=1  # Center
        )

        normal_style = styles['Normal']
        normal_style.fontSize = 9  # text-xs equivalent

        # Build PDF content
        content = []

        # Title - exactly matching frontend
        content.append(Paragraph("PAYMENT RECEIPT", title_style))
        content.append(Spacer(1, 12))

        # Main 2-column layout exactly matching frontend
        # Left side: Company and Customer details
        left_content = []

        # Company Details Section
        left_content.append(Paragraph(f"<b>{company_data.get('company_name', company_name)}</b>", normal_style))
        if company_data.get('company_address'):
            address_lines = company_data['company_address'].split('\n')
            for line in address_lines:
                if line.strip():
                    left_content.append(Paragraph(line, normal_style))
        left_content.append(Paragraph(f"<b>GSTIN/UIN:</b> {company_data.get('company_gst_number', 'GST Number')}", normal_style))
        left_content.append(Paragraph("<b>State Name:</b> Maharashtra, <b>Code:</b> 27", normal_style))
        left_content.append(Spacer(1, 8))

        # Separator line
        left_content.append(Paragraph("<b>Received From</b>", normal_style))
        left_content.append(Paragraph(f"<b>{customer_data.get('company_name', customer_name)}</b>", normal_style))
        if customer_data.get('address'):
            address_lines = customer_data['address'].split('\n')
            for line in address_lines:
                if line.strip():
                    left_content.append(Paragraph(line, normal_style))
        if customer_data.get('gst_number'):
            left_content.append(Paragraph(f"<b>GSTIN/UIN:</b> {customer_data['gst_number']}", normal_style))
        if customer_data.get('state_code'):
            left_content.append(Paragraph(f"<b>State Name:</b> Maharashtra, <b>Code:</b> {customer_data['state_code']}", normal_style))

        # Right side: Receipt details in 2-column grid (exactly like frontend)
        right_content = []

        # Left column of receipt details
        receipt_left_data = [
            ["Receipt No.", str(receipt_id)],
            ["Transaction ID", transaction_id or '-'],
            ["On Account of", on_account_of or '-']
        ]

        # Right column of receipt details
        receipt_right_data = [
            ["Dated", transaction_date],
            ["Payment Type", payment_type],
            ["Remarks", remark or '-']
        ]

        # Create receipt details table (2 columns side by side)
        receipt_details_data = []
        for i in range(len(receipt_left_data)):
            row = receipt_left_data[i] + [""] + receipt_right_data[i]  # Add spacer column
            receipt_details_data.append(row)

        receipt_table = Table(receipt_details_data, colWidths=[70, 80, 20, 70, 80])
        receipt_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        right_content.append(receipt_table)

        # Create main 2-column layout
        main_data = []

        # Add title row
        main_data.append([left_content[0], "", right_content[0]])  # Title and receipt table

        # Add company details rows
        for i in range(1, len(left_content)):
            if i < len(left_content):
                main_data.append([left_content[i], "", ""])
            else:
                main_data.append(["", "", ""])

        main_table = Table(main_data, colWidths=[200, 50, 250])
        main_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        content.append(main_table)
        content.append(Spacer(1, 20))

        # Table with Sl No, Particulars, Amount - exactly matching frontend
        table_data = [
            ['Sl No.', 'Particulars', 'Amount'],
            ['1', f'Payment Received{f"\nOn Account of: {on_account_of}" if on_account_of and on_account_of != '-' else ""}', f"₹{amount_received:,.2f}"],
            ['', 'Net Amount Received', f"₹{amount_received:,.2f}"]
        ]

        particulars_table = Table(table_data, colWidths=[40, 300, 80])
        particulars_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('SPAN', (0, -1), (1, -1)),  # Merge last row first two columns
        ]))

        content.append(particulars_table)
        content.append(Spacer(1, 15))

        # Amount in words section - exactly matching frontend format
        def number_to_words(num):
            ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
            tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
            teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

            def convert_less_than_thousand(n):
                if n == 0: return ''
                result = ''
                if n >= 100:
                    result += ones[n // 100] + ' Hundred '
                    n %= 100
                if n >= 20:
                    result += tens[n // 10] + ' '
                    n %= 10
                elif n >= 10:
                    result += teens[n - 10] + ' '
                    return result.strip()
                if n > 0 and n < 10:
                    result += ones[n] + ' '
                return result.strip()

            def convert(n):
                if n == 0: return 'Zero'
                result = ''
                crore = n // 10000000
                lakh = (n % 10000000) // 100000
                thousand = (n % 100000) // 1000
                remainder = n % 1000

                if crore > 0:
                    result += convert_less_than_thousand(crore) + ' Crore '
                if lakh > 0:
                    result += convert_less_than_thousand(lakh) + ' Lakh '
                if thousand > 0:
                    result += convert_less_than_thousand(thousand) + ' Thousand '
                if remainder > 0:
                    result += convert_less_than_thousand(remainder)

                return result.strip()

            rupees = int(num)
            paise = round((num - rupees) * 100)
            result = 'INR ' + convert(rupees)
            if paise > 0:
                result += ' and ' + convert(paise) + ' Paise'
            result += ' Only'
            return result

        words = number_to_words(amount_received)
        content.append(Paragraph(f"<b>Received Amount:</b> ₹{amount_received:,.2f}", normal_style))
        content.append(Paragraph(f"<b>Amount Received (in words)</b>", normal_style))
        content.append(Paragraph(words, normal_style))
        content.append(Spacer(1, 15))

        # Remarks section (only if present and not default)
        if remark and remark != '-' and remark.strip():
            content.append(Paragraph(f"<b>Remarks:</b> {remark}", normal_style))
            content.append(Spacer(1, 15))

        # Bank's Details section - exactly matching frontend
        content.append(Paragraph("<b>Company's Bank Details</b>", normal_style))
        content.append(Paragraph(f"A/c Holder's Name: {company_data.get('company_name', company_name)}", normal_style))
        content.append(Paragraph("Bank Name: Bank Name - Branch Code", normal_style))
        content.append(Paragraph("A/c No.: 1234567890", normal_style))
        content.append(Paragraph("Branch & IFS Code: Branch Name & IFSC0001234", normal_style))
        content.append(Spacer(1, 20))

        # Signatures section - exactly matching frontend 2-column layout
        signature_data = [
            ['Customer\'s Seal and Signature', '', f'for {company_data.get('company_name', company_name)}'],
            ['', '', 'Authorised Signatory']
        ]

        signature_table = Table(signature_data, colWidths=[150, 100, 150])
        signature_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('LINEBELOW', (0, 0), (0, 0), 1, colors.black),
            ('LINEBELOW', (2, 0), (2, 0), 1, colors.black),
        ]))

        content.append(Spacer(1, 30))
        content.append(signature_table)

        # Build PDF
        doc.build(content)

        # Get PDF data
        pdf_data = buffer.getvalue()
        buffer.close()

        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        logger.info(f"[RECEIPT_INVOICE] Successfully generated PDF using reportlab, size: {len(pdf_data)} bytes")
        return pdf_base64

    except Exception as e:
        logger.error(f"[RECEIPT_INVOICE] Failed to generate receipt invoice PDF: {e}")
        import traceback
        logger.error(f"[RECEIPT_INVOICE] Traceback: {traceback.format_exc()}")
        return None

def generate_adjustment_invoice_pdf(adjustment_data, adjustment_id):
    """Generate an adjustment invoice PDF using reportlab for reliability"""
    try:
        logger.info(f"[ADJUSTMENT_PDF] Starting PDF generation for adjustment ID: {adjustment_id}")

        # Import required modules for PDF generation
        import base64
        from io import BytesIO
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch

        # Get adjustment details
        adjustment_type = adjustment_data.get('adjustment_type', 'client')
        date_of_service = adjustment_data.get('date_of_service', '')
        particular_of_service = adjustment_data.get('particular_of_service', '')
        adjustment_amount = float(adjustment_data.get('adjustment_amount', 0))
        on_account_of = adjustment_data.get('on_account_of', '')
        remark = adjustment_data.get('remark', '')

        logger.info(f"[ADJUSTMENT_PDF] Adjustment type: {adjustment_type}, amount: {adjustment_amount}")

        # Get company and customer/vendor details based on adjustment type
        if adjustment_type == 'client':
            # Fetch company and customer details
            try:
                company_id = adjustment_data.get('company_id')
                customer_id = adjustment_data.get('customer_id')
                logger.info(f"[ADJUSTMENT_PDF] Client adjustment - company_id: {company_id}, customer_id: {customer_id}")

                company_query = "SELECT company_name, company_gst_number, company_address FROM company_details WHERE id = %s"
                company_result = execute_query(company_query, (company_id,))
                company_data = company_result[0] if company_result else {}
                logger.info(f"[ADJUSTMENT_PDF] Company data: {company_data}")

                customer_query = "SELECT company_name, gst_number, address, state_code FROM b2bcustomersdetails WHERE id = %s"
                customer_result = execute_query(customer_query, (customer_id,))
                customer_data = customer_result[0] if customer_result else {}
                logger.info(f"[ADJUSTMENT_PDF] Customer data: {customer_data}")
            except Exception as db_e:
                logger.warning(f"[ADJUSTMENT_PDF] Could not fetch company/customer details: {db_e}")
                company_data = {}
                customer_data = {}
        else:  # vendor adjustment
            try:
                company_id = adjustment_data.get('company_id')
                vendor_id = adjustment_data.get('vendor_id')
                logger.info(f"[ADJUSTMENT_PDF] Vendor adjustment - company_id: {company_id}, vendor_id: {vendor_id}")

                company_query = "SELECT company_name, company_gst_number, company_address FROM company_details WHERE id = %s"
                company_result = execute_query(company_query, (company_id,))
                company_data = company_result[0] if company_result else {}
                logger.info(f"[ADJUSTMENT_PDF] Company data: {company_data}")

                vendor_query = "SELECT vendor_name, gst_number, address, state FROM vendors WHERE id = %s"
                vendor_result = execute_query(vendor_query, (vendor_id,))
                customer_data = vendor_result[0] if vendor_result else {}
                if customer_data:
                    customer_data['company_name'] = customer_data.pop('vendor_name', '')
                    customer_data['state_code'] = customer_data.pop('state', '')
                logger.info(f"[ADJUSTMENT_PDF] Vendor data: {customer_data}")
            except Exception as db_e:
                logger.warning(f"[ADJUSTMENT_PDF] Could not fetch company/vendor details: {db_e}")
                company_data = {}
                customer_data = {}

        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()

        # Create custom styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1  # Center
        )

        normal_style = styles['Normal']
        normal_style.fontSize = 10

        # Build PDF content
        content = []

        # Title
        invoice_title = "CLIENT ADJUSTMENT INVOICE" if adjustment_type == 'client' else "VENDOR ADJUSTMENT INVOICE"
        content.append(Paragraph(invoice_title, title_style))
        content.append(Paragraph(f"Adjustment Entry #{adjustment_id}", styles['Heading3']))
        content.append(Spacer(1, 12))

        # Company and Customer/Vendor details
        company_info = [
            ['Company:', company_data.get('company_name', 'Company Name')],
            ['Address:', company_data.get('company_address', 'Company Address')],
            ['GST:', company_data.get('company_gst_number', 'GST Number')],
            ['', ''],
            [f"{adjustment_type.title()}:", customer_data.get('company_name', f"{adjustment_type.title()} Name")],
            ['Address:', customer_data.get('address', f"{adjustment_type.title()} Address")],
            ['GST:', customer_data.get('gst_number', 'GST Number')],
        ]

        details_info = [
            ['Adjustment No:', f'ADJ-{adjustment_id}'],
            ['Date:', date_of_service],
            ['Type:', f"{adjustment_type.title()} Adjustment"],
        ]

        if on_account_of:
            details_info.append(['On Account of:', on_account_of])

        # Create tables
        company_table = Table(company_info, colWidths=[80, 300])
        company_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        details_table = Table(details_info, colWidths=[80, 300])
        details_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        content.append(company_table)
        content.append(Spacer(1, 20))
        content.append(details_table)
        content.append(Spacer(1, 20))

        # Particulars table
        particulars_data = [
            ['Sl No.', 'Particulars', 'Amount'],
            ['1', particular_of_service, f"{'+' if adjustment_amount >= 0 else ''}₹{abs(adjustment_amount):,.2f}"],
            ['', 'Adjustment Amount', f"{'+' if adjustment_amount >= 0 else ''}₹{abs(adjustment_amount):,.2f}"]
        ]

        particulars_table = Table(particulars_data, colWidths=[50, 350, 100])
        particulars_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ]))

        content.append(particulars_table)
        content.append(Spacer(1, 20))

        # Remarks
        if remark:
            content.append(Paragraph(f"<b>Remarks:</b> {remark}", normal_style))
            content.append(Spacer(1, 10))

        # Signatures
        signature_data = [
            [f"{adjustment_type.title()}'s Seal and Signature", '', f'for {company_data.get('company_name', 'Company Name')}'],
            ['', '', 'Authorised Signatory']
        ]

        signature_table = Table(signature_data, colWidths=[200, 100, 200])
        signature_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('LINEBELOW', (0, 0), (0, 0), 1, colors.black),
            ('LINEBELOW', (2, 0), (2, 0), 1, colors.black),
        ]))

        content.append(Spacer(1, 40))
        content.append(signature_table)

        # Build PDF
        doc.build(content)

        # Get PDF data
        pdf_data = buffer.getvalue()
        buffer.close()

        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        logger.info(f"[ADJUSTMENT_PDF] Successfully generated PDF using reportlab, size: {len(pdf_data)} bytes")
        return pdf_base64

    except Exception as e:
        logger.error(f"[ADJUSTMENT_INVOICE] Failed to generate adjustment invoice PDF: {e}")
        import traceback
        logger.error(f"[ADJUSTMENT_INVOICE] Traceback: {traceback.format_exc()}")
        return None

def save_invoice_image_helper(data):
    """Helper function to save invoice image to database"""
    try:
        required_fields = ['invoice_no', 'image_data']
        for field in required_fields:
            if field not in data:
                return {
                    "status": "error",
                    "message": f"Field '{field}' is required"
                }

        # Decode base64 image data
        import base64
        try:
            image_binary = base64.b64decode(data['image_data'])
        except Exception as decode_error:
            return {
                "status": "error",
                "message": f"Failed to decode base64 image data: {str(decode_error)}"
            }

        # Insert into invoice_images table
        query = """
            INSERT INTO invoice_images (
                invoice_no, image_data, image_type, file_name, file_size, voucher_type
            ) VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (invoice_no)
            DO UPDATE SET
                image_data = EXCLUDED.image_data,
                image_type = EXCLUDED.image_type,
                file_name = EXCLUDED.file_name,
                file_size = EXCLUDED.file_size,
                voucher_type = EXCLUDED.voucher_type,
                generated_at = CURRENT_TIMESTAMP
            RETURNING id
        """

        file_name = data.get('file_name', f"Invoice_{data['invoice_no']}.pdf")
        file_size = len(image_binary)
        voucher_type = data.get('voucher_type', 'Sales')

        result = execute_query(query, (
            data['invoice_no'],
            image_binary,
            data.get('image_type', 'pdf'),
            file_name,
            file_size,
            voucher_type
        ))

        if result:
            image_id = result[0]['id']
            return {
                "status": "success",
                "data": {"image_id": image_id, "file_size": file_size},
                "message": f"Invoice image saved successfully for invoice: {data['invoice_no']}"
            }
        else:
            return {
                "status": "error",
                "message": "No ID returned from insert operation"
            }

    except Exception as e:
        logger.error(f"[INVOICE_IMAGE] Failed to save invoice image: {e}")
        return {
            "status": "error",
            "message": f"Failed to save invoice image: {str(e)}"
        }

@bookkeeping_bp.route('/save-invoice-image', methods=['POST'])
def save_invoice_image():
    """Save invoice PDF image to database"""
    result = save_invoice_image_helper(request.get_json())
    if result['status'] == 'success':
        return jsonify(result), 201
    else:
        return jsonify(result), 500

@bookkeeping_bp.route('/certificate/update-certificate-status', methods=['POST'])
def update_certificate_status():
    """Update certificate status to 'done' for finalized certificates"""
    try:
        data = request.get_json()

        if not data or 'selectedCourses' not in data:
            return jsonify({
                "error": "Missing required field",
                "message": "selectedCourses is required",
                "status": "validation_error"
            }), 400

        selected_courses = data['selectedCourses']
        status = data.get('status', 'done')

        if not selected_courses or len(selected_courses) == 0:
            return jsonify({
                "error": "No courses selected",
                "message": "At least one course must be selected",
                "status": "validation_error"
            }), 400

        # Get certificate selections to match by certificate_name, candidate_id, and candidate_name
        certificate_query = """
            SELECT id, certificate_name, candidate_id, candidate_name, client_name
            FROM certificate_selections
            WHERE status IS NULL OR status != 'done'
        """
        certificate_results = execute_query(certificate_query)

        if not certificate_results:
            return jsonify({
                "status": "success",
                "data": {"updated_count": 0},
                "message": "No certificates found to update"
            }), 200

        updated_count = 0

        # For each selected course, find matching certificates and update status
        for course_id in selected_courses:
            # Get the certificate details for this course_id from the certificate_selections table
            cert_query = """
                SELECT id, certificate_name, candidate_id, candidate_name
                FROM certificate_selections
                WHERE status IS NULL OR status != 'done'
            """
            cert_results = execute_query(cert_query)

            for cert in cert_results:
                # Update the status to 'done' for each certificate that matches the course_id
                # Since course_id corresponds to certificate id, update directly
                update_query = """
                    UPDATE certificate_selections
                    SET status = %s
                    WHERE id = %s AND (status IS NULL OR status != 'done')
                """
                result = execute_query(update_query, (status, course_id), fetch=False)
                if result and hasattr(result, 'rowcount') and result.rowcount > 0:
                    updated_count += 1
                    logger.info(f"[CERTIFICATE_STATUS] Updated certificate ID {course_id} status to '{status}'")
                    break

        logger.info(f"[CERTIFICATE_STATUS] Updated {updated_count} certificates to status '{status}'")
        return jsonify({
            "status": "success",
            "data": {"updated_count": updated_count},
            "message": f"Successfully updated {updated_count} certificates to status '{status}'"
        }), 200

    except Exception as e:
        logger.error(f"[CERTIFICATE_STATUS] Failed to update certificate status: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to update certificate status",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-payment-entry', methods=['POST'])
def create_vendor_payment_entry():
    """Create a new vendor payment entry"""
    try:
        data = request.get_json()

        required_fields = ['companyId', 'vendorId', 'dateOfPayment', 'transactionId', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate amount is positive
        if data['amount'] <= 0:
            return jsonify({
                "error": "Invalid amount",
                "message": "Payment amount must be greater than 0",
                "status": "validation_error"
            }), 400

        query = """
            INSERT INTO vendor_payments (
                vendor_id, company_id, payment_date, transaction_id, amount, on_account_of, remark
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        result = execute_query(query, (
            data['vendorId'],
            data['companyId'],
            data['dateOfPayment'],
            data['transactionId'],
            data['amount'],
            data.get('onAccountOf'),
            data.get('remark')
        ))

        if result:
            payment_id = result[0]['id']
            logger.info(f"[VENDOR_PAYMENT] Created vendor payment entry ID: {payment_id} for vendor: {data['vendorId']}")

            # After creating vendor payment, insert into Bank Ledger table
            try:
                # Get vendor details for bank ledger insertion
                vendor_query = "SELECT vendor_name FROM vendors WHERE id = %s"
                vendor_result = execute_query(vendor_query, (data['vendorId'],))

                if vendor_result and len(vendor_result) > 0:
                    vendor_name = vendor_result[0]['vendor_name']

                    bank_ledger_query = """
                        INSERT INTO bank_ledger (
                            payment_date, transaction_id, vendor_id, company_id, vendor_name,
                            amount, remark, transaction_type
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """

                    bank_remark = f"Payment to {vendor_name} - {data.get('transactionId', '')}"

                    execute_query(bank_ledger_query, (
                        data['dateOfPayment'],  # payment_date
                        data['transactionId'],  # transaction_id
                        data['vendorId'],  # vendor_id
                        data['companyId'],  # company_id
                        vendor_name,  # vendor_name
                        data['amount'],  # amount
                        bank_remark,  # remark
                        'payment'  # transaction_type
                    ), fetch=False)

                    logger.info(f"[BANK_LEDGER] Auto-inserted bank ledger entry for vendor payment ID: {payment_id}, transaction: {data['transactionId']}")
                else:
                    logger.warning(f"[BANK_LEDGER] No vendor found with ID: {data['vendorId']}, skipping bank ledger insertion")

            except Exception as bank_e:
                logger.error(f"[BANK_LEDGER] Failed to auto-insert bank ledger entry for vendor payment ID {payment_id}: {bank_e}")
                # Don't fail the payment creation if bank ledger insertion fails

            return jsonify({
                "status": "success",
                "data": {"payment_id": payment_id},
                "message": f"Vendor payment entry created successfully with ID: {payment_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create record",
                "message": "No ID returned from insert operation",
                "status": "error"
            }), 500

    except Exception as e:
        logger.error(f"[VENDOR_PAYMENT] Failed to create vendor payment entry: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to create vendor payment entry",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/vendor-service-entry', methods=['POST'])
def create_vendor_service_entry():
    """Create a new vendor service entry"""
    try:
        data = request.get_json()

        required_fields = ['companyId', 'vendorId', 'dateOfService', 'particularOfService', 'feesToBePaid']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        # Validate feesToBePaid is positive
        if data['feesToBePaid'] <= 0:
            return jsonify({
                "error": "Invalid amount",
                "message": "Fees to be paid must be greater than 0",
                "status": "validation_error"
            }), 400

        query = """
            INSERT INTO vendor_services (
                vendor_id, company_id, service_date, particulars, amount, on_account_of, remark
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        result = execute_query(query, (
            data['vendorId'],
            data['companyId'],
            data['dateOfService'],
            data['particularOfService'],
            data['feesToBePaid'],
            data.get('onAccountOf'),
            data.get('remark')
        ))

        if result:
            service_id = result[0]['id']
            logger.info(f"[VENDOR_SERVICE] Created vendor service entry ID: {service_id} for vendor: {data['vendorId']}")

            return jsonify({
                "status": "success",
                "data": {"service_id": service_id},
                "message": f"Vendor service entry created successfully with ID: {service_id}"
            }), 201
        else:
            return jsonify({
                "error": "Failed to create record",
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
