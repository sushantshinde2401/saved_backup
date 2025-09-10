import React, { useState, useRef } from 'react';
import '../../styles/invoice-print.css';
import '../../styles/modern-invoice.css';
import { downloadPDF, printHtmlElement } from '../../utils/printInvoice';
import { Trash2 } from 'lucide-react';

interface TaxInvoiceProps {
  invoiceData: any;
  companyData: any;
  customerData: any;
  bankData: any;
  isEditable?: boolean;
  onDataChange?: (data: any) => void;
}

export const TaxInvoice: React.FC<TaxInvoiceProps> = ({
  invoiceData,
  companyData,
  customerData,
  bankData,
  isEditable = false,
  onDataChange
}) => {
  const [optionalFields, setOptionalFields] = useState({
    deliveryNote: '',
    referenceNo: '',
    otherReferences: '',
    dispatchDocNo: '',
    deliveryNoteDate: '',
    dispatchedThrough: '',
    destination: ''
  });
  
  const [visibleFields, setVisibleFields] = useState({
    deliveryNote: true,
    referenceNo: true,
    otherReferences: true,
    dispatchDocNo: true,
    deliveryNoteDate: true,
    dispatchedThrough: true,
    destination: true
  });
  
  const handleFieldChange = (section: string, field: string, value: string) => {
    if (!isEditable || !onDataChange) return;
    
    onDataChange((prevData: any) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      },
      optionalFields: optionalFields
    }));
  };
  
  const handleOptionalFieldChange = (field: string, value: string) => {
    const newFields = { ...optionalFields, [field]: value };
    setOptionalFields(newFields);
    
    if (onDataChange) {
      onDataChange((prevData: any) => ({
        ...prevData,
        optionalFields: newFields,
        visibleFields: visibleFields
      }));
    }
  };
  
  const deleteOptionalField = (field: string) => {
    setVisibleFields(prev => ({ ...prev, [field]: false }));
    setOptionalFields(prev => ({ ...prev, [field]: '' }));
    
    if (onDataChange) {
      onDataChange((prevData: any) => ({
        ...prevData,
        optionalFields: { ...optionalFields, [field]: '' },
        visibleFields: { ...visibleFields, [field]: false }
      }));
    }
  };
  
  const EditableField: React.FC<{value: string, section: string, field: string, className?: string}> = 
    ({ value, section, field, className = "" }) => {
    if (!isEditable) {
      return <span className={className}>{value}</span>;
    }
    
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleFieldChange(section, field, e.target.value)}
        className={`bg-yellow-50 border border-yellow-300 rounded px-2 py-1 w-full ${className}`}
        style={{ minWidth: '100px' }}
      />
    );
  };
  
  const OptionalField: React.FC<{label: string, field: string}> = ({ label, field }) => {
    if (!visibleFields[field as keyof typeof visibleFields]) return null;
    
    if (!isEditable) {
      return optionalFields[field as keyof typeof optionalFields] ? (
        <div className="flex justify-between text-xs">
          <span className="font-medium">{label}:</span>
          <span>{optionalFields[field as keyof typeof optionalFields]}</span>
        </div>
      ) : null;
    }
    
    return (
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium w-32">{label}:</span>
        <div className="flex items-center gap-1 flex-1">
          <input
            type="text"
            value={optionalFields[field as keyof typeof optionalFields]}
            onChange={(e) => handleOptionalFieldChange(field, e.target.value)}
            className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-xs flex-1"
            placeholder="Enter value"
          />
          <button
            type="button"
            onClick={() => deleteOptionalField(field)}
            className="text-red-500 hover:text-red-700 p-1 ml-1"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };
  const generateInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    return `ASD-${yearSuffix}/0001`;
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    
    return 'Two Lakh';
  };

  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <div>

      <div ref={rootRef} className="modern-invoice-page mx-auto bg-white shadow-lg">
      
      {/* Modern Header with Brand Colors */}
      <div className="modern-header">
        <div className="header-gradient">
          <h1 className="modern-title">TAX INVOICE</h1>
        </div>
      </div>

      {/* Company Info Card */}
      <div className="company-card">
        <div className="company-info">
          <h2 className="company-title">
            <EditableField value={companyData.name || 'ANGEL SEAFARER DOCUMENTATION PRIVATE LIMITED'} section="company" field="name" />
          </h2>
          <div className="company-address">
            <EditableField value={companyData.address || 'SHOP NO-3, PUNIT TOWER-II CO. OP. HSG LTD, NEAR K STAR HOTEL, Navi Mumbai, Thane, Maharashtra, 400614'} section="company" field="address" />
          </div>
        </div>
        <div className="company-details">
          <div className="detail-item">
            <span className="detail-label">GSTIN</span>
            <span className="detail-value"><EditableField value={companyData.gstin || '27AAYCA0004D1Z0'} section="company" field="gstin" /></span>
          </div>
          <div className="detail-item">
            <span className="detail-label">State Code</span>
            <span className="detail-value"><EditableField value={companyData.stateCode || '27'} section="company" field="stateCode" /></span>
          </div>
        </div>
      </div>

      {/* Invoice Details Section */}
      <div className="invoice-section">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold min-w-[120px]">Invoice No:</span>
              <span className="font-medium">{generateInvoiceNumber()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold min-w-[120px]">Date:</span>
              <span className="font-medium">{new Date(invoiceData.date).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold min-w-[120px]">Mode/Terms of Payment:</span>
              <span className="font-medium">As per agreement</span>
            </div>
          </div>
          <div className="space-y-1">
            <OptionalField label="Delivery Note" field="deliveryNote" />
            <OptionalField label="Reference No & Date" field="referenceNo" />
            <OptionalField label="Other References" field="otherReferences" />
            <OptionalField label="Dispatch Doc No" field="dispatchDocNo" />
            <OptionalField label="Delivery Note Date" field="deliveryNoteDate" />
            <OptionalField label="Dispatched Through" field="dispatchedThrough" />
            <OptionalField label="Destination" field="destination" />
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="invoice-section">
        <h3 className="section-header mb-4">Bill To:</h3>
        <div className="text-sm space-y-1">
          <p className="font-semibold text-base">
            <EditableField value={customerData.name || 'Ocean Freight Services'} section="customer" field="name" />
          </p>
          <p className="leading-relaxed">
            <EditableField value={customerData.address || 'Ground Floor, Shipping Complex, Kandla, Gujarat, 370210'} section="customer" field="address" />
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <p><span className="font-semibold">GSTIN:</span> <EditableField value={customerData.gstin || '24RSTUV3456W7X8'} section="customer" field="gstin" /></p>
            <p><span className="font-semibold">State Code:</span> <EditableField value={customerData.stateCode || '24'} section="customer" field="stateCode" /></p>
          </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr className="table-header-row">
              <th className="col-sno">SI No</th>
              <th className="col-description">Particular</th>
              <th className="col-rate">Rate</th>
              <th className="col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="service-row">
              <td className="sno-cell"></td>
              <td className="desc-cell main-service">Service Charges</td>
              <td className="rate-cell"></td>
              <td className="amount-cell">₹{invoiceData.taxInvoice?.serviceCharges?.toLocaleString('en-IN', {minimumFractionDigits: 2}) || '16,949.15'}</td>
            </tr>
            {invoiceData.taxInvoice?.customerNames?.map((customer: any, index: number) => (
              <tr key={customer.id} className="customer-row">
                <td className="sno-cell">{index + 1}</td>
                <td className="desc-cell customer-name">{customer.name}</td>
                <td className="rate-cell">-</td>
                <td className="amount-cell">-</td>
              </tr>
            ))}
            <tr className="tax-row">
              <td className="sno-cell"></td>
              <td className="desc-cell tax-label">CGST</td>
              <td className="rate-cell tax-rate">9%</td>
              <td className="amount-cell">₹{invoiceData.taxInvoice?.cgst?.toLocaleString('en-IN', {minimumFractionDigits: 2}) || '1,525.42'}</td>
            </tr>
            <tr className="tax-row">
              <td className="sno-cell"></td>
              <td className="desc-cell tax-label">SGST</td>
              <td className="rate-cell tax-rate">9%</td>
              <td className="amount-cell">₹{invoiceData.taxInvoice?.sgst?.toLocaleString('en-IN', {minimumFractionDigits: 2}) || '1,525.42'}</td>
            </tr>
            <tr className="total-row">
              <td className="sno-cell"></td>
              <td className="desc-cell total-label">Total</td>
              <td className="rate-cell"></td>
              <td className="amount-cell total-amount">₹{invoiceData.taxInvoice?.totalAmount?.toLocaleString('en-IN', {minimumFractionDigits: 2}) || '20,000.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div className="amount-words">
        <strong>Amount in Words:</strong> {numberToWords(Math.floor(invoiceData.taxInvoice?.totalAmount || 20000))} Rupees Only
      </div>

      {/* Footer Grid */}
      <div className="footer-grid">
        <div className="bank-details">
          <h4 className="footer-title">Bank Details</h4>
          <div className="bank-info">
            <div><strong>Account Holder:</strong> <EditableField value={bankData?.bank_company_name || companyData.name} section="company" field="bankCompanyName" /></div>
            <div><strong>Bank:</strong> <EditableField value={bankData?.bank_name || 'IDFC FIRST BANK'} section="company" field="bankName" /></div>
            <div><strong>A/C No:</strong> <EditableField value={bankData?.account_number || companyData.accountNumber} section="company" field="accountNumber" /></div>
            <div><strong>IFSC:</strong> <EditableField value={bankData?.ifsc_code || 'IDFB0040172'} section="company" field="ifscCode" /></div>
          </div>
        </div>

        <div className="signature-section">
          <div className="signature-content">
            <div className="company-seal">Company Seal</div>
            <div className="signature-line">
              <div className="signature-space"></div>
              <div className="signature-label">Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="footer-note">
        <p>This is a computer generated invoice and does not require physical signature.</p>
        <p className="thank-you">Thank you for your business!</p>
      </div>


      </div>
    </div>
  );
};
