import React from 'react';
import { List, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

function ParticularInfoStep({
  particularinfoCustomers,
  onCustomerChange,
  onItemChange,
  onAddCustomer,
  onRemoveCustomer,
  onAddItem,
  onRemoveItem
}) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <List className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Particular Information</h3>
        <p className="text-gray-600">Specify the items and details for this invoice</p>
      </div>

      <div className="space-y-6">
        {particularinfoCustomers.map((customer, customerIndex) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-800">
                Customer {customerIndex + 1}
              </h4>
              {particularinfoCustomers.length > 1 && (
                <button
                  onClick={() => onRemoveCustomer(customer.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove customer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Customer Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Customer Name *
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => onCustomerChange(customer.id, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter customer name"
              />
            </div>

            {/* Course/Particular Items */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Course/Particular Items
              </label>
              {customer.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => onItemChange(customer.id, itemIndex, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter course/particular"
                  />
                  {customer.items.length > 1 && (
                    <button
                      onClick={() => onRemoveItem(customer.id, itemIndex)}
                      className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => onAddItem(customer.id)}
                className="inline-flex items-center gap-2 py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </motion.div>
        ))}

        <div className="flex justify-center pt-6">
          <button
            onClick={onAddCustomer}
            className="inline-flex items-center gap-2 py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParticularInfoStep;