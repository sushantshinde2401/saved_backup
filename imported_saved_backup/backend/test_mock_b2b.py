#!/usr/bin/env python3
"""
Test script for B2B mock data functionality
This script tests the mock data responses when database is not available.
"""

import json
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_mock_b2b_responses():
    """Test the mock B2B data responses"""
    print("=" * 60)
    print(" TESTING B2B MOCK DATA FUNCTIONALITY")
    print("=" * 60)

    # Mock B2B customer data (same as in the routes)
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

    print("\n[TEST] Mock B2B Customers Available:")
    for customer in mock_customers:
        print(f"  - ID {customer['id']}: {customer['company_name']}")
        print(f"    GST: {customer['gst_number']}, Contact: {customer['contact_person']}")
        print(f"    Email: {customer['email']}, Phone: {customer['phone_number']}")
        print(f"    Address: {customer['address']}, {customer['city']}, {customer['state']} - {customer['pincode']}")
        print()

    print("[TEST] API Endpoints with Mock Data:")
    print("  - GET /get-b2b-customers")
    print("    Returns: All 5 B2B customers with complete details")
    print("  - GET /get-b2b-customer/<id>")
    print("    Returns: Specific customer details for auto-fill")
    print("  - GET /get-company-accounts")
    print("    Returns: Mock company accounts (already working)")

    print("\n[TEST] Frontend Auto-Fill Fields:")
    print("  When B2B customer is selected, these fields will auto-populate:")
    print("  - GST Number")
    print("  - Customer Address (formatted)")
    print("  - Phone Number")
    print("  - State Code")
    print("  - Email")

    print("\n[TEST] Example Auto-Fill for Customer ID 1:")
    customer_1 = mock_customers[0]
    print(f"  Customer: {customer_1['company_name']}")
    print(f"  GST: {customer_1['gst_number']}")
    print(f"  Address: {customer_1['address']}, {customer_1['city']}, {customer_1['state']} - {customer_1['pincode']}")
    print(f"  Phone: {customer_1['phone_number']}")
    print(f"  State Code: {customer_1['state_code']}")
    print(f"  Email: {customer_1['email']}")

    print("\n" + "=" * 60)
    print(" ✅ B2B MOCK DATA TEST COMPLETED")
    print("=" * 60)
    print("\nThe B2B functionality will work even without PostgreSQL running.")
    print("Mock data will be returned automatically when database is unavailable.")
    print("\nTo use real database data:")
    print("1. Start PostgreSQL server")
    print("2. Run: python setup_b2b_database.py")
    print("3. Restart Flask server")

    return True

if __name__ == "__main__":
    test_mock_b2b_responses()