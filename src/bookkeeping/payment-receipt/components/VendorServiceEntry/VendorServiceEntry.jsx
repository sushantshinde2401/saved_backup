import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { getAllCompanies, getAllVendors, getCompanyDetails } from '../../../shared/utils/api';

function VendorServiceEntry() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed search state variables as we're using select dropdowns

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [companiesResponse, vendorsResponse] = await Promise.all([
        getAllCompanies(),
        getAllVendors()
      ]);

      if (companiesResponse.status === 'success') {
        setCompanies(companiesResponse.data || []);
      } else {
        setError('Failed to load companies');
      }

      if (vendorsResponse.status === 'success') {
        setVendors(vendorsResponse.data || []);
      } else {
        setError('Failed to load vendors');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = async (company) => {
    setSelectedCompany(company);

    try {
      const detailsResponse = await getCompanyDetails(company.account_number);
      if (detailsResponse.status === 'success') {
        setCompanyDetails(detailsResponse.data);
      } else {
        setCompanyDetails(null);
      }
    } catch (err) {
      console.error('Error loading company details:', err);
      setCompanyDetails(null);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setVendorDetails(vendor);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-orange-700 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                Vendor Service Entry
              </h1>
            </div>
            <button
              onClick={() => navigate('/bookkeeping/payment-receipt')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Payment/Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-6 h-6 text-blue-700 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Select Company</h2>
            </div>

            {/* Company Dropdown */}
            <div className="mb-4">
              <select
                value={selectedCompany ? selectedCompany.id : ''}
                onChange={(e) => {
                  const companyId = e.target.value;
                  const company = companies.find(c => c.id === parseInt(companyId));
                  if (company) {
                    handleCompanySelect(company);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name} - {company.account_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Details */}
            {companyDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Company Details
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {companyDetails.company_name}</p>
                  <p><strong>GST:</strong> {companyDetails.company_gst_number}</p>
                  <p><strong>Address:</strong> {companyDetails.company_address}</p>
                  <p><strong>Bank:</strong> {companyDetails.bank_name}</p>
                  <p><strong>IFSC:</strong> {companyDetails.ifsc_code}</p>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-700 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Select Vendor</h2>
            </div>

            {/* Vendor Dropdown */}
            <div className="mb-4">
              <select
                value={selectedVendor ? selectedVendor.id : ''}
                onChange={(e) => {
                  const vendorId = e.target.value;
                  const vendor = vendors.find(v => v.id === parseInt(vendorId));
                  if (vendor) {
                    handleVendorSelect(vendor);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a vendor...</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendor_name} - {vendor.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Details */}
            {vendorDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Vendor Details
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {vendorDetails.vendor_name}</p>
                  <p><strong>Company:</strong> {vendorDetails.company_name}</p>
                  <p><strong>Contact:</strong> {vendorDetails.contact_person}</p>
                  <p><strong>Phone:</strong> {vendorDetails.phone}</p>
                  <p><strong>Email:</strong> {vendorDetails.email}</p>
                  <p><strong>Address:</strong> {vendorDetails.address}</p>
                  <p><strong>Type:</strong> {vendorDetails.vendor_type}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State Messages */}
        {companies.length === 0 && !loading && (
          <div className="mt-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No companies available</p>
          </div>
        )}

        {vendors.length === 0 && !loading && (
          <div className="mt-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vendors available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorServiceEntry;