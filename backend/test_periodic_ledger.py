import pytest
from routes.bookkeeping import (
    get_daily_ledger, get_monthly_ledger, get_yearly_ledger,
    get_outstanding_dues, export_data
)
from unittest.mock import patch, MagicMock

class TestPeriodicLedger:
    """Unit tests for Periodic Ledger API endpoints"""

    @patch('routes.bookkeeping.execute_query')
    def test_get_daily_ledger_success(self, mock_execute_query):
        """Test successful daily ledger retrieval"""
        # Mock database response
        mock_execute_query.return_value = [
            {
                'id': 1,
                'transaction_id': 'TXN001',
                'date': '2024-01-15',
                'time': '10:30:00',
                'description': 'Training fee',
                'company_id': 1,
                'company_name': 'Tech Solutions',
                'type': 'income',
                'amount': 50000,
                'payment_mode': 'UPI',
                'status': 'paid',
                'due_date': None,
                'category': 'training',
                'batch_id': 1,
                'created_at': '2024-01-15 10:30:00'
            }
        ]

        # Mock request
        with patch('routes.bookkeeping.request') as mock_request:
            mock_request.args = {'date': '2024-01-15'}

            # Call the function
            response = get_daily_ledger()

            # Assertions
            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'success'
            assert 'transactions' in data['data']
            assert 'summary' in data['data']
            assert len(data['data']['transactions']) == 1
            assert data['data']['summary']['total_income'] == 50000

    @patch('routes.bookkeeping.execute_query')
    def test_get_monthly_ledger_success(self, mock_execute_query):
        """Test successful monthly ledger retrieval"""
        mock_execute_query.return_value = [
            {
                'date': '2024-01-15',
                'type': 'income',
                'amount': 100000,
                'payment_mode': 'Bank Transfer',
                'status': 'paid',
                'company_name': 'Global Corp',
                'category': 'certificate'
            }
        ]

        with patch('routes.bookkeeping.request') as mock_request:
            mock_request.args = {'month': '1', 'year': '2024'}

            response = get_monthly_ledger()

            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'success'
            assert 'chart_data' in data['data']
            assert 'summary' in data['data']
            assert 'transactions' in data['data']

    @patch('routes.bookkeeping.execute_query')
    def test_get_yearly_ledger_success(self, mock_execute_query):
        """Test successful yearly ledger retrieval"""
        mock_execute_query.return_value = [
            {
                'month': 1,
                'total_income': 500000,
                'total_expenses': 300000,
                'net_profit': 200000,
                'certificates_issued': 50,
                'pending_payments': 10000
            }
        ]

        with patch('routes.bookkeeping.request') as mock_request:
            mock_request.args = {'year': '2024'}

            response = get_yearly_ledger()

            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'success'
            assert 'monthly_table' in data['data']
            assert 'yearly_totals' in data['data']
            assert data['data']['yearly_totals']['net_profit'] == 200000

    def test_get_daily_ledger_missing_date(self):
        """Test daily ledger with missing date parameter"""
        with patch('routes.bookkeeping.request') as mock_request:
            mock_request.args = {}

            response = get_daily_ledger()

            assert response.status_code == 400
            data = response.get_json()
            assert data['status'] == 'validation_error'
            assert 'Date is required' in data['message']

    def test_get_monthly_ledger_missing_params(self):
        """Test monthly ledger with missing parameters"""
        with patch('routes.bookkeeping.request') as mock_request:
            mock_request.args = {'month': '1'}  # Missing year

            response = get_monthly_ledger()

            assert response.status_code == 400
            data = response.get_json()
            assert data['status'] == 'validation_error'

    @patch('routes.bookkeeping.execute_query')
    def test_get_outstanding_dues_success(self, mock_execute_query):
        """Test successful outstanding dues retrieval"""
        mock_execute_query.return_value = [
            {
                'company_id': 1,
                'company_name': 'Tech Solutions',
                'total_due': 25000,
                'due_date': '2024-01-01',
                'overdue_count': 1,
                'last_transaction_date': '2024-01-10'
            }
        ]

        with patch('routes.bookkeeping.request') as mock_request:
            mock_request.args = {'period': 'daily'}

            response = get_outstanding_dues()

            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'success'
            assert len(data['data']) == 1
            assert data['data'][0]['amount_due'] == 25000

    @patch('routes.bookkeeping.execute_query')
    @patch('routes.bookkeeping.datetime')
    def test_export_data_success(self, mock_datetime, mock_execute_query):
        """Test successful data export"""
        mock_datetime.now.return_value.strftime.return_value = '20240115_143000'

        with patch('routes.bookkeeping.request') as mock_request:
            mock_request.get_json.return_value = {
                'type': 'pdf',
                'period': 'daily',
                'filters': {'date': '2024-01-15'}
            }

            response = export_data()

            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'success'
            assert 'export_url' in data['data']

if __name__ == '__main__':
    pytest.main([__file__])