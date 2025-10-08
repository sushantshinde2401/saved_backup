import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FileText, ArrowLeft, Calculator, Building, Users, DollarSign, Calendar, MessageSquare } from 'lucide-react';

function AdjustmentEntry() {
  const navigate = useNavigate();
  const [adjustmentType, setAdjustmentType] = useState('client');

  // Client form states
  const [clientSelectedCompany, setClientSelectedCompany] = useState('');
  const [clientSelectedCustomer, setClientSelectedCustomer] = useState('');
  const [clientCompanies, setClientCompanies] = useState([]);
  const [clientCustomers, setClientCustomers] = useState([]);
  const [clientLoadingCompanies, setClientLoadingCompanies] = useState(false);
  const [clientLoadingCustomers, setClientLoadingCustomers] = useState(false);
  const [clientSubmitting, setClientSubmitting] = useState(false);
  const [clientError, setClientError] = useState('');

  // Vendor form states
  const [vendorSelectedCompany, setVendorSelectedCompany] = useState('');
  const [vendorSelectedVendor, setVendorSelectedVendor] = useState('');
  const [vendorCompanies, setVendorCompanies] = useState([]);
  const [vendorVendors, setVendorVendors] = useState([]);
  const [vendorLoadingCompanies, setVendorLoadingCompanies] = useState(false);
  const [vendorLoadingVendors, setVendorLoadingVendors] = useState(false);
  const [vendorSubmitting, setVendorSubmitting] = useState(false);
  const [vendorError, setVendorError] = useState('');

  const clientForm = useForm({
    defaultValues: {
      dateOfService: '',
      particularOfService: '',
      adjustmentAmount: '',
      onAccountOf: '',
      remark: ''
    }
  });

  const vendorForm = useForm({
    defaultValues: {
      dateOfService: '',
      particularOfService: '',
      adjustmentAmount: '',
      onAccountOf: '',
      remark: ''
    }
  });

  // Fetch companies when adjustmentType changes
  useEffect(() => {
    if (adjustmentType === 'client') {
      fetchClientCompanies();
    } else if (adjustmentType === 'vendor') {
      fetchVendorCompanies();
    }
  }, [adjustmentType]);

  // Fetch customers when client company is selected
  useEffect(() => {
    if (adjustmentType === 'client' && clientSelectedCompany) {
      fetchClientCustomers();
    }
  }, [adjustmentType, clientSelectedCompany]);

  // Fetch vendors when vendor company is selected
  useEffect(() => {
    if (adjustmentType === 'vendor' && vendorSelectedCompany) {
      fetchVendorVendors();
    }
  }, [adjustmentType, vendorSelectedCompany]);

  const fetchClientCompanies = async () => {
    setClientLoadingCompanies(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookkeeping/get-all-companies');
      const data = await response.json();
      if (data.status === 'success') {
        setClientCompanies(data.data.map(company => ({
          value: company.id,
          label: company.company_name
        })));
      } else {
        setClientError('Failed to load companies');
      }
    } catch (err) {
      setClientError('Failed to load companies');
      console.error('Error fetching companies:', err);
    } finally {
      setClientLoadingCompanies(false);
    }
  };

  const fetchClientCustomers = async () => {
    setClientLoadingCustomers(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookkeeping/get-b2b-customers');
      const data = await response.json();
      if (data.status === 'success') {
        setClientCustomers(data.data.map(customer => ({
          value: customer.id,
          label: customer.company_name
        })));
      } else {
        setClientError('Failed to load customers');
      }
    } catch (err) {
      setClientError('Failed to load customers');
      console.error('Error fetching customers:', err);
    } finally {
      setClientLoadingCustomers(false);
    }
  };

  const fetchVendorCompanies = async () => {
    setVendorLoadingCompanies(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookkeeping/get-all-companies');
      const data = await response.json();
      if (data.status === 'success') {
        setVendorCompanies(data.data.map(company => ({
          value: company.id,
          label: company.company_name
        })));
      } else {
        setVendorError('Failed to load companies');
      }
    } catch (err) {
      setVendorError('Failed to load companies');
      console.error('Error fetching companies:', err);
    } finally {
      setVendorLoadingCompanies(false);
    }
  };

  const fetchVendorVendors = async () => {
    setVendorLoadingVendors(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookkeeping/get-all-vendors');
      const data = await response.json();
      if (data.status === 'success') {
        setVendorVendors(data.data.map(vendor => ({
          value: vendor.id,
          label: vendor.vendor_name
        })));
      } else {
        setVendorError('Failed to load vendors');
      }
    } catch (err) {
      setVendorError('Failed to load vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setVendorLoadingVendors(false);
    }
  };

  const onClientSubmit = async (data) => {
    if (!clientSelectedCompany || !clientSelectedCustomer) {
      toast.error('Please select all required fields');
      return;
    }

    setClientSubmitting(true);
    try {
      const payload = {
        adjustment_type: 'client',
        company_id: clientSelectedCompany,
        customer_id: clientSelectedCustomer,
        vendor_id: null,
        date_of_service: data.dateOfService,
        particular_of_service: data.particularOfService,
        adjustment_amount: parseFloat(data.adjustmentAmount),
        on_account_of: data.onAccountOf || null,
        remark: data.remark || null
      };

      const response = await fetch('http://localhost:5000/api/bookkeeping/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Client adjustment entry created successfully!');
        clientForm.reset();
        setClientSelectedCompany('');
        setClientSelectedCustomer('');
      } else {
        toast.error(result.message || 'Failed to create adjustment entry');
      }
    } catch (err) {
      toast.error('Failed to create adjustment entry');
      console.error('Error submitting form:', err);
    } finally {
      setClientSubmitting(false);
    }
  };

  const onVendorSubmit = async (data) => {
    if (!vendorSelectedCompany || !vendorSelectedVendor) {
      toast.error('Please select all required fields');
      return;
    }

    setVendorSubmitting(true);
    try {
      const payload = {
        adjustment_type: 'vendor',
        company_id: vendorSelectedCompany,
        customer_id: null,
        vendor_id: vendorSelectedVendor,
        date_of_service: data.dateOfService,
        particular_of_service: data.particularOfService,
        adjustment_amount: parseFloat(data.adjustmentAmount),
        on_account_of: data.onAccountOf || null,
        remark: data.remark || null
      };

      const response = await fetch('http://localhost:5000/api/bookkeeping/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Vendor adjustment entry created successfully!');
        vendorForm.reset();
        setVendorSelectedCompany('');
        setVendorSelectedVendor('');
      } else {
        toast.error(result.message || 'Failed to create adjustment entry');
      }
    } catch (err) {
      toast.error('Failed to create adjustment entry');
      console.error('Error submitting form:', err);
    } finally {
      setVendorSubmitting(false);
    }
  };

  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) {
      return 'Amount must be a non-zero number';
    }
    return true;
  };

  const validateDate = (value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    if (selectedDate > today) {
      return 'Date of service must not be in the future';
    }
    return true;
  };

  const validateParticularOfService = (value) => {
    if (value && value.length > 500) {
      return 'Particular of service must not exceed 500 characters';
    }
    return true;
  };

  const validateRemark = (value) => {
    if (value && value.length > 1000) {
      return 'Remark must not exceed 1000 characters';
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="w-8 h-8 text-blue-700 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                Adjustment Entry
              </h1>
            </div>
            <button
              onClick={() => navigate('/bookkeeping/payment-receipt')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Payment/Receipt Entries
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Adjustment Type Selection */}
          <div className="border-b border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type</label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="client"
                  checked={adjustmentType === 'client'}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="mr-2"
                />
                Client Adjustment
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="vendor"
                  checked={adjustmentType === 'vendor'}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="mr-2"
                />
                Vendor Adjustment
              </label>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {adjustmentType === 'client' && (
              <>
                {clientError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{clientError}</p>
                  </div>
                )}

                <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Client Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Building className="w-4 h-4 inline mr-1" />
                          Select Company *
                        </label>
                        <select
                          value={clientSelectedCompany}
                          onChange={(e) => setClientSelectedCompany(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={clientLoadingCompanies}
                          aria-label="Select Company"
                        >
                          <option value="">
                            {clientLoadingCompanies ? 'Loading...' : 'Choose a company'}
                          </option>
                          {clientCompanies.map((company) => (
                            <option key={company.value} value={company.value}>
                              {company.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Users className="w-4 h-4 inline mr-1" />
                          Select Customer *
                        </label>
                        <select
                          value={clientSelectedCustomer}
                          onChange={(e) => setClientSelectedCustomer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!clientSelectedCompany || clientLoadingCustomers}
                          aria-label="Select Customer"
                        >
                          <option value="">
                            {!clientSelectedCompany ? 'Select company first' : clientLoadingCustomers ? 'Loading...' : 'Choose a customer'}
                          </option>
                          {clientCustomers.map((customer) => (
                            <option key={customer.value} value={customer.value}>
                              {customer.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields - Only show when both dropdowns are selected */}
                  {clientSelectedCompany && clientSelectedCustomer && (
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date of Service */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date of Service *
                          </label>
                          <input
                            type="date"
                            {...clientForm.register('dateOfService', {
                              required: 'Date of service is required',
                              validate: validateDate
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Date of Service"
                          />
                          {clientForm.formState.errors.dateOfService && (
                            <p className="mt-1 text-sm text-red-600">{clientForm.formState.errors.dateOfService.message}</p>
                          )}
                        </div>

                        {/* Adjustment Amount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            Adjustment (Amount) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...clientForm.register('adjustmentAmount', {
                              required: 'Adjustment amount is required',
                              validate: validateAmount
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            aria-label="Adjustment Amount"
                          />
                          {clientForm.formState.errors.adjustmentAmount && (
                            <p className="mt-1 text-sm text-red-600">{clientForm.formState.errors.adjustmentAmount.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Particular of Service */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText className="w-4 h-4 inline mr-1" />
                          Particular of Service *
                        </label>
                        <input
                          type="text"
                          maxLength="500"
                          {...clientForm.register('particularOfService', {
                            required: 'Particular of service is required',
                            validate: validateParticularOfService
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter service details (max 500 characters)"
                          aria-label="Particular of Service"
                        />
                        {clientForm.formState.errors.particularOfService && (
                          <p className="mt-1 text-sm text-red-600">{clientForm.formState.errors.particularOfService.message}</p>
                        )}
                      </div>

                      {/* On Account Of */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          On Account Of
                        </label>
                        <input
                          type="text"
                          {...clientForm.register('onAccountOf')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Optional account reference"
                          aria-label="On Account Of"
                        />
                      </div>

                      {/* Remark */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          Remark
                        </label>
                        <textarea
                          maxLength="1000"
                          {...clientForm.register('remark', { validate: validateRemark })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Optional remarks (max 1000 characters)"
                          aria-label="Remark"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-6">
                        <button
                          type="submit"
                          disabled={clientSubmitting}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                          {clientSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-5 h-5" />
                              Create Client Adjustment Entry
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </>
            )}

            {adjustmentType === 'vendor' && (
              <>
                {vendorError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{vendorError}</p>
                  </div>
                )}

                <form onSubmit={vendorForm.handleSubmit(onVendorSubmit)} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Vendor Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Building className="w-4 h-4 inline mr-1" />
                          Select Company *
                        </label>
                        <select
                          value={vendorSelectedCompany}
                          onChange={(e) => setVendorSelectedCompany(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={vendorLoadingCompanies}
                          aria-label="Select Company"
                        >
                          <option value="">
                            {vendorLoadingCompanies ? 'Loading...' : 'Choose a company'}
                          </option>
                          {vendorCompanies.map((company) => (
                            <option key={company.value} value={company.value}>
                              {company.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Users className="w-4 h-4 inline mr-1" />
                          Select Vendor *
                        </label>
                        <select
                          value={vendorSelectedVendor}
                          onChange={(e) => setVendorSelectedVendor(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!vendorSelectedCompany || vendorLoadingVendors}
                          aria-label="Select Vendor"
                        >
                          <option value="">
                            {!vendorSelectedCompany ? 'Select company first' : vendorLoadingVendors ? 'Loading...' : 'Choose a vendor'}
                          </option>
                          {vendorVendors.map((vendor) => (
                            <option key={vendor.value} value={vendor.value}>
                              {vendor.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields - Only show when both dropdowns are selected */}
                  {vendorSelectedCompany && vendorSelectedVendor && (
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date of Service */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date of Service *
                          </label>
                          <input
                            type="date"
                            {...vendorForm.register('dateOfService', {
                              required: 'Date of service is required',
                              validate: validateDate
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Date of Service"
                          />
                          {vendorForm.formState.errors.dateOfService && (
                            <p className="mt-1 text-sm text-red-600">{vendorForm.formState.errors.dateOfService.message}</p>
                          )}
                        </div>

                        {/* Adjustment Amount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            Adjustment (Amount) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...vendorForm.register('adjustmentAmount', {
                              required: 'Adjustment amount is required',
                              validate: validateAmount
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            aria-label="Adjustment Amount"
                          />
                          {vendorForm.formState.errors.adjustmentAmount && (
                            <p className="mt-1 text-sm text-red-600">{vendorForm.formState.errors.adjustmentAmount.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Particular of Service */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText className="w-4 h-4 inline mr-1" />
                          Particular of Service *
                        </label>
                        <input
                          type="text"
                          maxLength="500"
                          {...vendorForm.register('particularOfService', {
                            required: 'Particular of service is required',
                            validate: validateParticularOfService
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter service details (max 500 characters)"
                          aria-label="Particular of Service"
                        />
                        {vendorForm.formState.errors.particularOfService && (
                          <p className="mt-1 text-sm text-red-600">{vendorForm.formState.errors.particularOfService.message}</p>
                        )}
                      </div>

                      {/* On Account Of */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          On Account Of
                        </label>
                        <input
                          type="text"
                          {...vendorForm.register('onAccountOf')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Optional account reference"
                          aria-label="On Account Of"
                        />
                      </div>

                      {/* Remark */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          Remark
                        </label>
                        <textarea
                          maxLength="1000"
                          {...vendorForm.register('remark', { validate: validateRemark })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Optional remarks (max 1000 characters)"
                          aria-label="Remark"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-6">
                        <button
                          type="submit"
                          disabled={vendorSubmitting}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                          {vendorSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-5 h-5" />
                              Create Vendor Adjustment Entry
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdjustmentEntry;