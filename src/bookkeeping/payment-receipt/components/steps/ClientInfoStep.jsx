import React from 'react';
import { Users } from 'lucide-react';

function ClientInfoStep({ formData, onInputChange, customers }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Client Info</h3>
        <p className="text-gray-600">Add client information for the invoice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Type */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Customer Type *
          </label>
          <div className="flex space-x-6">
            {['B2B', 'B2C'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  value={type}
                  checked={formData.customerType === type}
                  onChange={(e) => onInputChange('customerType', e.target.value)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-gray-700 font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* B2B Customer Fields */}
        {formData.customerType === 'B2B' && (
          <>
            {/* Select B2B Customer */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select B2B Customer *
              </label>
              <select
                value={formData.selectedB2BCustomer}
                onChange={(e) => onInputChange('selectedB2BCustomer', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Select B2B Customer</option>
                {customers.length > 0 ? (
                  customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading customers...</option>
                )}
              </select>
              {customers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No B2B customers available. Please check your database connection.
                </p>
              )}
            </div>

            {/* B2B GST Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                GST Number
              </label>
              <input
                type="text"
                value={formData.b2bCustomerGstNumber}
                onChange={(e) => onInputChange('b2bCustomerGstNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter GST number"
              />
            </div>

            {/* B2B Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.b2bPhoneNumber}
                onChange={(e) => onInputChange('b2bPhoneNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter phone number"
              />
            </div>

            {/* B2B Address */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Address
              </label>
              <textarea
                value={formData.b2bCustomerAddress}
                onChange={(e) => onInputChange('b2bCustomerAddress', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter address"
                rows="4"
              />
            </div>

            {/* B2B State Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                State Code
              </label>
              <input
                type="text"
                value={formData.b2bCustomerStateCode}
                onChange={(e) => onInputChange('b2bCustomerStateCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter state code"
              />
            </div>

            {/* B2B Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email
              </label>
              <input
                type="email"
                value={formData.b2bEmail}
                onChange={(e) => onInputChange('b2bEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter email"
              />
            </div>
          </>
        )}

        {/* B2C Customer Fields */}
        {formData.customerType === 'B2C' && (
          <>
            {/* B2C Full Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.b2cFullName}
                onChange={(e) => onInputChange('b2cFullName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter full name"
              />
            </div>

            {/* B2C Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.b2cPhoneNumber}
                onChange={(e) => onInputChange('b2cPhoneNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter phone number"
              />
            </div>

            {/* B2C Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email
              </label>
              <input
                type="email"
                value={formData.b2cEmail}
                onChange={(e) => onInputChange('b2cEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter email"
              />
            </div>

            {/* B2C Address */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Address *
              </label>
              <textarea
                value={formData.b2cAddress}
                onChange={(e) => onInputChange('b2cAddress', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter address"
                rows="4"
              />
            </div>

            {/* B2C City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                City *
              </label>
              <input
                type="text"
                value={formData.b2cCity}
                onChange={(e) => onInputChange('b2cCity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter city"
              />
            </div>

            {/* B2C State */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                State *
              </label>
              <input
                type="text"
                value={formData.b2cState}
                onChange={(e) => onInputChange('b2cState', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter state"
              />
            </div>

            {/* B2C Pincode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Pincode *
              </label>
              <input
                type="text"
                value={formData.b2cPincode}
                onChange={(e) => onInputChange('b2cPincode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter pincode"
              />
            </div>

            {/* B2C Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.b2cDateOfBirth}
                onChange={(e) => onInputChange('b2cDateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* B2C Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Gender
              </label>
              <select
                value={formData.b2cGender}
                onChange={(e) => onInputChange('b2cGender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ClientInfoStep;