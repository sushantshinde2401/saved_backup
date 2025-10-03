import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, Calendar, FileText, User } from 'lucide-react';

function BillingInfoStep({ formData, onInputChange, availableCertificates }) {
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

  // Force re-render GST calculations when amount changes
  useEffect(() => {
    // This ensures GST fields update immediately when amountReceived changes
  }, [formData.amountReceived]);

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amountReceived) || 0;
    if (formData.applyGST) {
      const gstRate = parseFloat(formData.gstRate) || 18;
      return (amount + (amount * gstRate / 100)).toFixed(2);
    }
    return amount.toFixed(2);
  };

  const handleCourseSelection = (courseId) => {
    const isCurrentlySelected = formData.selectedCourses?.includes(courseId) || false;
    const newSelectedCourses = isCurrentlySelected
      ? formData.selectedCourses.filter(id => id !== courseId)
      : [...(formData.selectedCourses || []), courseId];

    // Update selected courses
    onInputChange('selectedCourses', newSelectedCourses);
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
            Amount Received *
          </label>
          <input
            type="number"
            value={formData.amountReceived || ''}
            onChange={(e) => onInputChange('amountReceived', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter amount received"
          />
        </div>


        {/* Apply GST Checkbox and Rate Input */}
        <div className="md:col-span-2 flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.applyGST || false}
              onChange={(e) => onInputChange('applyGST', e.target.checked)}
              className="w-4 h-4 mr-2"
              id="gst-checkbox"
            />
            <label htmlFor="gst-checkbox" className="text-sm font-medium text-gray-700">Apply GST</label>
          </div>
          {formData.applyGST && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">GST Rate (%):</label>
              <input
                type="number"
                value={formData.gstRate || 18}
                onChange={(e) => onInputChange('gstRate', e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          )}
        </div>

        {/* CGST and SGST Fields - Only show when GST is applied */}
        {formData.applyGST && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                CGST ({((parseFloat(formData.gstRate) || 18) / 2).toFixed(2)}%)
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold bg-blue-50 text-blue-800">
                ₹{((parseFloat(formData.amountReceived) || 0) * ((parseFloat(formData.gstRate) || 18) / 2) / 100).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                SGST ({((parseFloat(formData.gstRate) || 18) / 2).toFixed(2)}%)
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold bg-blue-50 text-blue-800">
                ₹{((parseFloat(formData.amountReceived) || 0) * ((parseFloat(formData.gstRate) || 18) / 2) / 100).toFixed(2)}
              </div>
            </div>
          </>
        )}

        {/* Final Amount */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Final Amount {formData.applyGST ? '(After GST)' : ''}
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold text-lg bg-green-50 text-green-800">
            ₹{calculateFinalAmount()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Base: ₹{(parseFloat(formData.amountReceived) || 0).toLocaleString('en-IN')}
            {formData.applyGST && ` + GST: ₹${((parseFloat(formData.amountReceived) || 0) * (parseFloat(formData.gstRate) || 18) / 100).toFixed(2)}`}
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
                        {certificate.certificateName}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Generated: {new Date(certificate.timestamp).toLocaleDateString()}
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {certificate.companyName}
                        </span>
                      </p>
                    </div>
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
    </div>
  );
}

export default BillingInfoStep;