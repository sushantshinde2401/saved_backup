import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, Calendar, FileText, User, RotateCcw } from 'lucide-react';

function BillingInfoStep({ formData, onInputChange, onClearData, availableCertificates, rateData }) {
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [rateWarning, setRateWarning] = useState('');
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);



  // Load data on component mount
  useEffect(() => {
    loadAvailableCompanies();
  }, []);

  // Load available companies from certificate selections
  const loadAvailableCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch('http://localhost:5000/get-certificate-selections-for-receipt');
      if (response.ok) {
        const result = await response.json();
        const certificates = result.data || [];

        // Extract unique company names from certificates where companyName is not empty
        const companies = [...new Set(
          certificates
            .filter(cert => cert.companyName && cert.companyName.trim() !== '')
            .map(cert => cert.companyName)
        )];

        setAvailableCompanies(companies);
      } else {
        console.warn('[BILLING] Failed to load companies from certificates');
        setAvailableCompanies([]);
      }
    } catch (error) {
      console.error('[BILLING] Error loading companies from certificates:', error);
      setAvailableCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Load certificates when party name changes
  useEffect(() => {
    if (formData.partyName) {
      loadCertificatesForCompany(formData.partyName);
    }
  }, [formData.partyName]);

  const loadCertificatesForCompany = async (companyName) => {
    try {
      const response = await fetch('http://localhost:5000/get-certificate-selections-for-receipt');
      if (response.ok) {
        const result = await response.json();
        const allCertificates = result.data || [];

        // Filter certificates for the selected company
        const companyCertificates = allCertificates.filter(cert =>
          cert.companyName === companyName
        );

        // Update available certificates (this would need to be passed back to parent)
        // For now, we'll work with the filtered certificates
        console.log('[BILLING] Loaded certificates for company:', companyName, companyCertificates);
      }
    } catch (error) {
      console.error('[BILLING] Error loading certificates for company:', error);
    }
  };

  // Calculate amount when courses change
  useEffect(() => {
    calculateTotalAmount();
  }, [formData.selectedCourses, formData.partyName, rateData]);

  const calculateTotalAmount = () => {
    if (!formData.partyName || !formData.selectedCourses || formData.selectedCourses.length === 0) {
      setCalculatedAmount(0);
      setRateWarning('');
      return;
    }

    let totalAmount = 0;
    let warnings = [];
    const companyRates = rateData[formData.partyName] || {};

    formData.selectedCourses.forEach(courseId => {
      const certificate = availableCertificates.find(cert => cert.id === courseId);
      if (certificate) {
        const rate = companyRates[certificate.certificateName] || 0;
        totalAmount += rate;

        if (rate === 0) {
          warnings.push(`${certificate.certificateName}: Rate not found`);
        }
      }
    });

    setCalculatedAmount(totalAmount);
    onInputChange('amountReceived', totalAmount.toString());

    if (warnings.length > 0) {
      setRateWarning(`⚠️ ${warnings.join(', ')}`);
    } else {
      setRateWarning('');
    }
  };

  const handleCourseSelection = (courseId) => {
    const isCurrentlySelected = formData.selectedCourses?.includes(courseId) || false;
    const newSelectedCourses = isCurrentlySelected
      ? formData.selectedCourses.filter(id => id !== courseId)
      : [...(formData.selectedCourses || []), courseId];

    onInputChange('selectedCourses', newSelectedCourses);
  };

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amountReceived) || 0;
    if (formData.applyGST) {
      return (amount + (amount * 0.18)).toFixed(2);
    }
    return amount.toFixed(2);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Receipt className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Billing Info</h3>
        <p className="text-gray-600">Configure billing details and select courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Party Name (Auto-populated from B2B Customer) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Party Name (Company) *
          </label>
          <input
            type="text"
            value={formData.partyName || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            placeholder="Will be auto-populated from B2B Customer selection"
          />
          <p className="text-sm text-gray-500 mt-1">
            Party name is automatically set from the selected B2B customer in Client Info step.
          </p>
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Invoice No. *
          </label>
          <input
            type="text"
            value={formData.invoiceNumber || ''}
            onChange={(e) => onInputChange('invoiceNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter invoice number"
          />
        </div>

        {/* Date Received */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Received *
          </label>
          <input
            type="date"
            value={formData.dateReceived || ''}
            onChange={(e) => onInputChange('dateReceived', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Amount Received */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Amount Received
          </label>
          <input
            type="number"
            value={formData.amountReceived || ''}
            onChange={(e) => onInputChange('amountReceived', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Auto-calculated from courses"
            readOnly
          />
          {rateWarning && (
            <p className="text-sm text-orange-600 mt-1">{rateWarning}</p>
          )}
        </div>


        {/* Apply GST Checkbox */}
        <div className="md:col-span-2 flex items-center">
          <input
            type="checkbox"
            checked={formData.applyGST || false}
            onChange={(e) => onInputChange('applyGST', e.target.checked)}
            className="w-4 h-4 mr-2"
            id="gst-checkbox"
          />
          <label htmlFor="gst-checkbox" className="text-sm font-medium text-gray-700">Apply GST (18%)</label>
        </div>

        {/* Final Amount */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Final Amount {formData.applyGST ? '(After GST)' : ''}
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 text-green-800 font-bold text-lg">
            ₹{calculateFinalAmount()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Base: ₹{(parseFloat(formData.amountReceived) || 0).toLocaleString('en-IN')}
            {formData.applyGST && ' + GST (18%)'}
          </p>
        </div>


      </div>

      {/* Course Selection */}
      <div className="mt-8">
        <h4 className="text-lg font-bold text-gray-800 mb-4">
          Select Courses * {formData.partyName ? `(for ${formData.partyName})` : ''}
        </h4>
        {!formData.partyName ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Please select a company first</p>
            <p className="text-sm">Select a party name above to load available courses</p>
          </div>
        ) : availableCertificates && availableCertificates.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableCertificates
              .filter(certificate => certificate.companyName === formData.partyName)
              .map((certificate) => (
                <div
                  key={certificate.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    formData.selectedCourses?.includes(certificate.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selectedCourses?.includes(certificate.id) || false}
                      onChange={() => handleCourseSelection(certificate.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <h5 className="font-semibold text-gray-800">
                        {certificate.firstName} {certificate.lastName} - {certificate.certificateName}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Generated: {new Date(certificate.timestamp).toLocaleDateString()}
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {certificate.companyName}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">
                      ₹{rateData[formData.partyName] && rateData[formData.partyName][certificate.certificateName]
                        ? rateData[formData.partyName][certificate.certificateName].toLocaleString()
                        : '0'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No certificates available for {formData.partyName}</p>
            <p className="text-sm">Generate certificates for this company to see them here</p>
          </div>
        )}
      </div>

      {/* Total Amount Display */}
      {calculatedAmount > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-green-800">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">₹{calculatedAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Clear Data Button */}
      <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onClearData}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-colors font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Data
        </button>
      </div>
    </div>
  );
}

export default BillingInfoStep;