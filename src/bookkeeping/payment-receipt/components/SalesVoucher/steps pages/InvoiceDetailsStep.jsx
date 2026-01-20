import React from 'react';
import { Truck, FileText, Calendar, MapPin, FileCheck } from 'lucide-react';

function InvoiceDetailsStep({ formData, onInputChange }) {
  // Delivery note options
  const deliveryNoteOptions = ["Note A", "Note B", "Note C", "Note D"];

  // Dispatch through options
  const dispatchedThroughOptions = ["Courier", "Hand Delivery", "Transport", "Email"];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Truck className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Invoice Details</h3>
        <p className="text-gray-600">Configure delivery and dispatch information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileCheck className="w-4 h-4 inline mr-1" />
            Delivery Note
          </label>
          <select
            value={formData.deliveryNote || ''}
            onChange={(e) => onInputChange('deliveryNote', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Delivery Note</option>
            {deliveryNoteOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Dispatch Doc No. */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Dispatch Doc No.
          </label>
          <input
            type="text"
            value={formData.dispatchDocNo || ''}
            onChange={(e) => onInputChange('dispatchDocNo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Auto-generated or enter manually"
          />
        </div>

        {/* Delivery Note Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Delivery Note Date
          </label>
          <input
            type="date"
            value={formData.deliveryNoteDate || ''}
            onChange={(e) => onInputChange('deliveryNoteDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Leave blank to use Date Received"
          />
        </div>

        {/* Dispatch Through */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Truck className="w-4 h-4 inline mr-1" />
            Dispatch Through
          </label>
          <select
            value={formData.dispatchThrough || ''}
            onChange={(e) => onInputChange('dispatchThrough', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Option</option>
            {dispatchedThroughOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Destination
          </label>
          <input
            type="text"
            value={formData.destination || ''}
            onChange={(e) => onInputChange('destination', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter destination"
          />
        </div>

        {/* Terms of Delivery */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Terms of Delivery
          </label>
          <textarea
            value={formData.termsOfDelivery || ''}
            onChange={(e) => onInputChange('termsOfDelivery', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter terms of delivery"
            rows="4"
          />
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailsStep;