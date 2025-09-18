from flask import Blueprint, request, jsonify
from database.db_connection import execute_query
import logging

logger = logging.getLogger(__name__)

bookkeeping_bp = Blueprint('bookkeeping', __name__)

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
    """Get all company accounts (existing endpoint)"""
    try:
        # This would typically come from a company_accounts table
        # For now, returning sample data
        sample_accounts = [
            {
                'id': 1,
                'account_number': 'ACC001',
                'company_name': 'Angel Maritime Services',
                'bank_name': 'HDFC Bank',
                'branch': 'Connaught Place',
                'ifsc_code': 'HDFC0000123',
                'swift_code': 'HDFCINBB',
                'gst_number': '07AAAAA0000A1Z5',
                'company_address': '123 Business Center, Connaught Place, New Delhi - 110001',
                'state_code': '07'
            },
            {
                'id': 2,
                'account_number': 'ACC002',
                'company_name': 'Maritime Solutions Ltd',
                'bank_name': 'ICICI Bank',
                'branch': 'Karol Bagh',
                'ifsc_code': 'ICIC0000456',
                'swift_code': 'ICICINBB',
                'gst_number': '07BBBBB0000B2Y4',
                'company_address': '456 Industrial Area, Karol Bagh, New Delhi - 110005',
                'state_code': '07'
            }
        ]

        logger.info(f"[COMPANY] Retrieved {len(sample_accounts)} company accounts")
        return jsonify({
            "status": "success",
            "data": sample_accounts,
            "message": f"Retrieved {len(sample_accounts)} company accounts successfully",
            "total": len(sample_accounts)
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
        # This would typically query a database table
        # For now, returning sample data based on account number
        company_details_map = {
            'ACC001': {
                'company_name': 'Angel Maritime Services',
                'company_gst_number': '07AAAAA0000A1Z5',
                'company_address': '123 Business Center, Connaught Place, New Delhi - 110001',
                'bank_name': 'HDFC Bank',
                'branch': 'Connaught Place',
                'ifsc_code': 'HDFC0000123',
                'swift_code': 'HDFCINBB',
                'state_code': '07'
            },
            'ACC002': {
                'company_name': 'Maritime Solutions Ltd',
                'company_gst_number': '07BBBBB0000B2Y4',
                'company_address': '456 Industrial Area, Karol Bagh, New Delhi - 110005',
                'bank_name': 'ICICI Bank',
                'branch': 'Karol Bagh',
                'ifsc_code': 'ICIC0000456',
                'swift_code': 'ICICINBB',
                'state_code': '07'
            }
        }

        if account_number in company_details_map:
            details = company_details_map[account_number]
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

        required_fields = ['candidate_id', 'amount_received', 'payment_type', 'transaction_date', 'invoice_reference']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}",
                    "message": f"Field '{field}' is required",
                    "status": "validation_error"
                }), 400

        query = """
            INSERT INTO ReceiptAmountReceived (
                candidate_id, amount_received, payment_type, transaction_date,
                remark, invoice_reference
            ) VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING receipt_amount_id
        """

        result = execute_query(query, (
            data['candidate_id'],
            data['amount_received'],
            data['payment_type'],
            data['transaction_date'],
            data.get('remark'),
            data['invoice_reference']
        ))

        if result:
            receipt_id = result[0]['receipt_amount_id']
            logger.info(f"[RECEIPT] Created receipt amount received record ID: {receipt_id}")
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
        candidate_id = request.args.get('candidate_id', type=int)
        invoice_reference = request.args.get('invoice_reference')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)

        # Build query based on filters
        if candidate_id:
            query = """
                SELECT * FROM ReceiptAmountReceived
                WHERE candidate_id = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            params = (candidate_id, limit, offset)
        elif invoice_reference:
            query = """
                SELECT * FROM ReceiptAmountReceived
                WHERE invoice_reference = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            params = (invoice_reference, limit, offset)
        else:
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
                    'candidate_id': row['candidate_id'],
                    'amount_received': float(row['amount_received']) if row['amount_received'] else 0,
                    'payment_type': row['payment_type'],
                    'transaction_date': str(row['transaction_date']) if row['transaction_date'] else None,
                    'remark': row['remark'],
                    'invoice_reference': row['invoice_reference'],
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
                'candidate_id': receipt['candidate_id'],
                'amount_received': float(receipt['amount_received']) if receipt['amount_received'] else 0,
                'payment_type': receipt['payment_type'],
                'transaction_date': str(receipt['transaction_date']) if receipt['transaction_date'] else None,
                'remark': receipt['remark'],
                'invoice_reference': receipt['invoice_reference'],
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
                "message": f"No receipt amount received record found with ID: {receipt_id}",
                "status": "not_found"
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

        allowed_fields = ['candidate_id', 'amount_received', 'payment_type', 'transaction_date', 'remark', 'invoice_reference']
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
    """Delete a receipt amount received record"""
    try:
        query = "DELETE FROM ReceiptAmountReceived WHERE receipt_amount_id = %s"
        execute_query(query, (receipt_id,), fetch=False)

        logger.info(f"[RECEIPT] Deleted receipt amount received record ID: {receipt_id}")
        return jsonify({
            "status": "success",
            "message": f"Receipt amount received record ID {receipt_id} deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"[RECEIPT] Failed to delete receipt amount received ID {receipt_id}: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to delete receipt amount received record",
            "status": "error"
        }), 500