#!/usr/bin/env python3
"""
Test script to verify receipt processing and automatic ledger insertion
"""

import requests
import json
import time

def test_receipt_ledger_integration():
    """Test the integration between receipt creation and ledger insertion"""

    base_url = "http://localhost:5000"

    # Test data
    test_receipt_data = {
        "candidate_id": 1,
        "account_no": "ACC001",
        "company_name": "Test Company",
        "amount_received": 50000.00,
        "payment_type": "Bank Transfer",
        "transaction_date": "2025-09-25",
        "tds_percentage": 0,
        "gst": 0,
        "customer_name": "Tech Solutions India Pvt Ltd",  # This should match a company in ledger
        "transaction_id": "TXN_TEST_001",
        "on_account_of": "Training Services",
        "remark": "Test receipt for ledger integration"
    }

    print("🧪 Testing Receipt to Ledger Integration")
    print("=" * 50)

    try:
        # Step 1: Create receipt
        print("📝 Step 1: Creating receipt entry...")
        response = requests.post(
            f"{base_url}/api/bookkeeping/receipt-amount-received",
            json=test_receipt_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 201:
            receipt_result = response.json()
            receipt_id = receipt_result['data']['receipt_amount_id']
            print(f"✅ Receipt created successfully with ID: {receipt_id}")

            # Step 2: Verify receipt was created
            print("🔍 Step 2: Verifying receipt data...")
            response = requests.get(f"{base_url}/api/bookkeeping/receipt-amount-received/{receipt_id}")
            if response.status_code == 200:
                receipt_data = response.json()['data']
                print(f"✅ Receipt data verified: Customer={receipt_data['customer_name']}, Amount={receipt_data['amount_received']}")

                # Step 3: Check if ledger entry was created
                print("📊 Step 3: Checking ledger entries...")
                ledger_response = requests.get(
                    f"{base_url}/api/bookkeeping/company-ledger?company_name={test_receipt_data['customer_name']}"
                )

                if ledger_response.status_code == 200:
                    ledger_data = ledger_response.json()
                    entries = ledger_data['data']['entries']

                    # Look for our entry
                    found_entry = None
                    for entry in entries:
                        if entry['voucher_no'] == f"RCPT-{receipt_id}":
                            found_entry = entry
                            break

                    if found_entry:
                        print("✅ Ledger entry found!")
                        print(f"   Date: {found_entry['date']}")
                        print(f"   Particulars: {found_entry['particulars']}")
                        print(f"   Credit: {found_entry['credit']}")
                        print(f"   Voucher No: {found_entry['voucher_no']}")
                        print(f"   Voucher Type: {found_entry['voucher_type']}")

                        # Verify the data matches
                        expected_particulars = f"Account No: {test_receipt_data['account_no']}"
                        if (found_entry['particulars'] == expected_particulars and
                            found_entry['credit'] == test_receipt_data['amount_received'] and
                            found_entry['voucher_type'] == 'Receipt'):
                            print("✅ All ledger data matches expected values!")
                        else:
                            print("❌ Ledger data doesn't match expected values")
                            print(f"   Expected particulars: {expected_particulars}")
                            print(f"   Actual particulars: {found_entry['particulars']}")
                    else:
                        print("❌ No matching ledger entry found")
                        print("   Available entries:")
                        for entry in entries[:3]:  # Show first 3
                            print(f"     - {entry['voucher_no']}: {entry['particulars']}")
                else:
                    print(f"❌ Failed to fetch ledger data: {ledger_response.status_code}")
            else:
                print(f"❌ Failed to verify receipt: {response.status_code}")
        else:
            print(f"❌ Failed to create receipt: {response.status_code}")
            print(f"   Response: {response.text}")

        # Step 4: Test deletion (only if we have a found_entry)
        if 'found_entry' in locals() and found_entry:
            print("🗑️  Step 4: Testing deletion...")
            delete_response = requests.delete(f"{base_url}/api/bookkeeping/company-ledger/{found_entry['id']}")
            if delete_response.status_code == 200:
                print("✅ Ledger entry deleted successfully")

                # Verify deletion by checking ledger again
                verify_response = requests.get(
                    f"{base_url}/api/bookkeeping/company-ledger?company_name={test_receipt_data['customer_name']}"
                )
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    verify_entries = verify_data['data']['entries']
                    still_found = any(e['id'] == found_entry['id'] for e in verify_entries)
                    if not still_found:
                        print("✅ Ledger entry confirmed deleted from display")
                    else:
                        print("❌ Ledger entry still found after deletion")
                else:
                    print("❌ Could not verify deletion")

                # Also verify receipt is deleted
                receipt_verify = requests.get(f"{base_url}/api/bookkeeping/receipt-amount-received/{receipt_id}")
                if receipt_verify.status_code == 404:
                    print("✅ Associated receipt also deleted")
                else:
                    print("❌ Associated receipt still exists")
            else:
                print(f"❌ Failed to delete ledger entry: {delete_response.status_code}")
        else:
            print("⚠️  Skipping delete test - no ledger entry found")

    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the server running?")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

    print("=" * 50)
    print("🧪 Test completed")

if __name__ == "__main__":
    test_receipt_ledger_integration()