import React from 'react';
import { Building, Loader } from 'lucide-react';

function OrgInfoStep({ formData, onInputChange, loadingCompanyDetails, companyAccounts }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Building className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Organization Info</h3>
        <p className="text-gray-600">Enter your organization information for the invoice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Account Number */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Company Account Number *
          </label>
          <select
            value={formData.companyAccountNumber}
            onChange={(e) => onInputChange('companyAccountNumber', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          >
            <option value="">Select Account Number</option>
            {companyAccounts.length > 0 ? (
              companyAccounts.map(account => (
                <option key={account.id} value={account.account_number}>
                  {account.account_number} - {account.company_name}
                </option>
              ))
            ) : (
              <option disabled>No accounts available</option>
            )}
          </select>
          {loadingCompanyDetails && (
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Loading organization details...
            </div>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => onInputChange('companyName', e.target.value)}
            disabled={loadingCompanyDetails}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              loadingCompanyDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter company name"
          />
        </div>

        {/* GST Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            GST Number (GSTIN/UIN)
          </label>
          <input
            type="text"
            value={formData.gstNumber}
            onChange={(e) => onInputChange('gstNumber', e.target.value)}
            disabled={loadingCompanyDetails}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              loadingCompanyDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter GST number"
          />
        </div>

        {/* Company Address */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Company Address
          </label>
          <textarea
            value={formData.companyAddress}
            onChange={(e) => onInputChange('companyAddress', e.target.value)}
            disabled={loadingCompanyDetails}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              loadingCompanyDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter company address"
            rows="4"
          />
        </div>

        {/* State Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            State Code
          </label>
          <input
            type="text"
            value={formData.stateCode}
            onChange={(e) => onInputChange('stateCode', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Enter state code"
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Bank Name
          </label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => onInputChange('bankName', e.target.value)}
            disabled={loadingCompanyDetails}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              loadingCompanyDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter bank name"
          />
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Branch
          </label>
          <input
            type="text"
            value={formData.branch}
            onChange={(e) => onInputChange('branch', e.target.value)}
            disabled={loadingCompanyDetails}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              loadingCompanyDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter branch name"
          />
        </div>

        {/* IFSC Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            IFSC Code
          </label>
          <input
            type="text"
            value={formData.ifscCode}
            onChange={(e) => onInputChange('ifscCode', e.target.value)}
            disabled={loadingCompanyDetails}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              loadingCompanyDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter IFSC code"
          />
        </div>

        {/* SWIFT Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            SWIFT Code
          </label>
          <input
            type="text"
            value={formData.swiftCode}
            onChange={(e) => onInputChange('swiftCode', e.target.value)}
            disabled={loadingCompanyDetails}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              loadingCompanyDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter SWIFT code"
          />
        </div>
      </div>
    </div>
  );
}

export default OrgInfoStep;