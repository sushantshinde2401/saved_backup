import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Building,
  User,
  Calculator,
  CheckCircle
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

function VendorAdjustmentInvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adjustmentData } = location.state || {};

  // State for editable fields
  const [selectedDate, setSelectedDate] = useState(adjustmentData?.date_of_service || '');
  const [particulars, setParticulars] = useState(adjustmentData?.particular_of_service || '');
  const [adjustmentAmount, setAdjustmentAmount] = useState(adjustmentData?.adjustment_amount || 0);
  const [onAccountOf, setOnAccountOf] = useState(adjustmentData?.on_account_of || '');
  const [remark, setRemark] = useState(adjustmentData?.remark || '');

  // Company and vendor data
  const [companyData, setCompanyData] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adjustmentData) {
      fetchAdjustmentDetails();
    }
  }, [adjustmentData]);

  // Auto-save invoice to database when all data is loaded
  useEffect(() => {
    if (adjustmentData && companyData && vendorData && !loading) {
      autoSaveInvoice();
    }
  }, [adjustmentData, companyData, vendorData, loading]);

  const fetchAdjustmentDetails = async () => {
    try {
      // Fetch adjustment details from the new endpoint
      const adjustmentResponse = await fetch(`http://localhost:5000/api/bookkeeping/get-vendor-adjustment/${adjustmentData.id}`);
      const adjustmentResult = await adjustmentResponse.json();
      if (adjustmentResult.status === 'success') {
        const data = adjustmentResult.data;
        setCompanyData({
          company_name: data.company_name,
          gst_number: data.company_gst,
          company_address: data.company_address,
          state_code: data.company_state_code
        });
        setVendorData({
          vendor_name: data.vendor_name,
          gst_number: data.vendor_gst,
          vendor_address: data.vendor_address,
          state_code: data.vendor_state_code
        });
      }
    } catch (error) {
      console.error('Error fetching adjustment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoSaveInvoice = async () => {
    const element = document.querySelector('.adjustment-invoice-content');
    if (element) {
      const clonedElement = element.cloneNode(true);
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.width = '100%';
      clonedElement.style.maxWidth = 'none';

      const opt = {
        margin: 0.5,
        filename: `Vendor_Adjustment_Invoice_${adjustmentData?.id || 'N/A'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
          allowTaint: false
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      };

      try {
        // Generate PDF blob for saving to database
        const pdfBlob = await html2pdf().set(opt).from(clonedElement).outputPdf('blob');

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix

          // Save to database
          try {
            const invoiceNo = `ADJ-${adjustmentData?.id || 'N/A'}`;
            const response = await fetch('http://localhost:5000/api/files/save-invoice-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                invoice_no: invoiceNo,
                image_data: base64Data,
                image_type: 'pdf',
                file_name: `Vendor_Adjustment_Invoice_${invoiceNo}.pdf`,
                voucher_type: 'Adjustment'
              }),
            });

            if (response.ok) {
              console.log('Vendor adjustment invoice automatically saved to database successfully');
            } else {
              console.error('Failed to auto-save vendor adjustment invoice to database');
            }
          } catch (saveError) {
            console.error('Error auto-saving vendor adjustment invoice to database:', saveError);
          }
        };
        reader.readAsDataURL(pdfBlob);

      } catch (error) {
        console.error('Error generating PDF for auto-save:', error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const invoiceNo = `ADJ-${adjustmentData?.id || 'N/A'}`;

      // First try to get the already generated PDF from database
      const response = await fetch(`http://localhost:5000/api/files/get-invoice-image/${invoiceNo}`);

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data?.image_data) {
          // Convert base64 to blob and download
          const base64Data = result.data.image_data;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.data.file_name || `Vendor_Adjustment_Invoice_${invoiceNo}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          console.log('Downloaded existing vendor adjustment invoice from database');
          return;
        }
      }

      // Fallback: Generate new PDF if not found in database
      console.log('Vendor adjustment invoice not found in database, generating new PDF');
      const element = document.querySelector('.adjustment-invoice-content');
      if (element) {
        const clonedElement = element.cloneNode(true);
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.width = '100%';
        clonedElement.style.maxWidth = 'none';

        const opt = {
          margin: 0.5,
          filename: `Vendor_Adjustment_Invoice_${adjustmentData?.id || 'N/A'}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            letterRendering: true,
            allowTaint: false
          },
          jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          }
        };

        // Generate and download PDF
        html2pdf().set(opt).from(clonedElement).save();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback: Generate new PDF
      const element = document.querySelector('.adjustment-invoice-content');
      if (element) {
        const clonedElement = element.cloneNode(true);
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.width = '100%';
        clonedElement.style.maxWidth = 'none';

        const opt = {
          margin: 0.5,
          filename: `Vendor_Adjustment_Invoice_${adjustmentData?.id || 'N/A'}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            letterRendering: true,
            allowTaint: false
          },
          jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          }
        };

        html2pdf().set(opt).from(clonedElement).save();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Adjustment Invoice...</h2>
          <p className="text-gray-600">Please wait while we prepare your invoice.</p>
        </div>
      </div>
    );
  }

  if (!adjustmentData || !companyData || !vendorData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Adjustment Data Found</h2>
          <p className="text-gray-600 mb-6">Please go back to the adjustment entries page and try again.</p>
          <button
            onClick={() => navigate('/bookkeeping/payment-receipt')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Payment/Receipt Entries
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-layout {
            flex-direction: column;
            gap: 0;
          }
          .print-layout > .flex-1 {
            max-width: none;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b no-print">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Adjustment Entries
                </button>
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vendor Adjustment Invoice</h1>
                    <p className="text-gray-600 text-sm">Professional adjustment invoice layout</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => navigate('/bookkeeping/payment-receipt')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6 max-w-7xl mx-auto p-4 print-layout">
          {/* Invoice Content - Left Side */}
          <div className="flex-1 max-w-2xl">
            <div className="adjustment-invoice-content p-4 bg-white shadow-lg">
              {/* Adjustment Invoice Header */}
              <div className="text-center mb-2 bg-white px-4 py-2">
                <h1 className="text-3xl font-bold text-gray-800 tracking-wide">VENDOR ADJUSTMENT INVOICE</h1>
                <p className="text-sm text-gray-600 mt-1">Adjustment Entry #{adjustmentData.id}</p>
              </div>

              {/* Top Section with Company/Vendor and Invoice Details */}
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Left Side - Company and Vendor Details */}
                <div className="space-y-3">
                  {/* Company Details Section */}
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-1">{companyData.company_name}</h2>
                    <div className="text-xs text-gray-700 leading-tight">
                      {companyData.company_address.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    <div className="text-xs mt-1">
                      <strong>GSTIN/UIN:</strong> {companyData.gst_number}
                    </div>
                    <div className="text-xs">
                      <strong>State Code:</strong> {companyData.state_code}
                    </div>
                  </div>

                  {/* Separator Line */}
                  <div className="border-t border-gray-400 my-2"></div>

                  {/* Vendor Details Section */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">Vendor (Bill to)</h3>
                    <div className="text-xs font-semibold text-gray-800 mb-1">{vendorData.vendor_name}</div>
                    <div className="text-xs text-gray-700 leading-tight mb-1">
                      {vendorData.vendor_address.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    {vendorData.gst_number && (
                      <div className="text-xs mb-1">
                        <strong>GSTIN/UIN:</strong> {vendorData.gst_number}
                      </div>
                    )}
                    {vendorData.state_code && (
                      <div className="text-xs">
                        <strong>State Code:</strong> {vendorData.state_code}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Adjustment Details */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Adjustment Details */}
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>Adjustment No.</strong><br />
                      <span className="text-gray-700">ADJ-{adjustmentData.id}</span>
                    </div>
                    <div className="text-xs">
                      <strong>Dated</strong><br />
                      <span className="text-gray-700">{selectedDate}</span>
                    </div>
                    <div className="text-xs">
                      <strong>Adjustment Type</strong><br />
                      <span className="text-gray-700">Vendor Adjustment</span>
                    </div>
                    {onAccountOf && (
                      <div className="text-xs">
                        <strong>On Account Of</strong><br />
                        <span className="text-gray-700">{onAccountOf}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Adjustment Details Section */}
              <div className="mb-4">
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  <thead>
                    <tr>
                      <th className="border border-gray-400 p-1 text-center w-12">Sl No.</th>
                      <th className="border border-gray-400 p-1 text-left">Particulars</th>
                      <th className="border border-gray-400 p-1 text-center w-20">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 p-1 text-center">1</td>
                      <td className="border border-gray-400 p-1">
                        <div className="whitespace-pre-line text-xs">{particulars}</div>
                        {onAccountOf && (
                          <div className="text-xs text-gray-600 mt-1">
                            On Account of: {onAccountOf}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-400 p-1 text-right">
                        <span className="text-xs">
                          {adjustmentAmount >= 0 ? '+' : ''}₹{Math.abs(adjustmentAmount).toLocaleString()}
                        </span>
                      </td>
                    </tr>

                    {/* Total Row */}
                    <tr className="bg-gray-50">
                      <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">
                        Adjustment Amount
                      </td>
                      <td className="border border-gray-400 p-1 text-right font-semibold text-xs">
                        {adjustmentAmount >= 0 ? '+' : ''}₹{Math.abs(adjustmentAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remarks Section */}
              {remark && (
                <div className="mb-3 text-xs">
                  <strong>Remarks:</strong><br />
                  <div className="mt-1 text-gray-700">{remark}</div>
                </div>
              )}

              {/* Separator Line */}
              <div className="border-t border-gray-400 my-2"></div>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="text-center">
                  <div className="border-b border-gray-400 pb-8 mb-1"></div>
                  <strong className="text-xs">Vendor's Seal and Signature</strong>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 pb-8 mb-1"></div>
                  <strong className="text-xs">for {companyData.company_name}</strong><br />
                  <strong className="text-xs">Authorised Signatory</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Adjustment Controls Sidebar - Right Side */}
          <div className="input-controls w-96 bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit sticky top-4 max-h-screen overflow-y-auto no-print">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">VENDOR ADJUSTMENT INVOICE</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adjustment Controls</h3>

            {/* Adjustment Details Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Adjustment Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Particulars</label>
                  <textarea
                    value={particulars}
                    onChange={(e) => setParticulars(e.target.value)}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    rows="3"
                    placeholder="Enter adjustment particulars"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Amount</label>
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    step="0.01"
                    placeholder="Enter amount (positive for credit, negative for debit)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">On Account Of</label>
                  <input
                    type="text"
                    value={onAccountOf}
                    onChange={(e) => setOnAccountOf(e.target.value)}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Optional account reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    rows="3"
                    placeholder="Optional remarks"
                  />
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Adjustment Status</h4>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Adjustment Recorded</p>
                  <p className="text-xs text-green-600">ID: {adjustmentData.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default VendorAdjustmentInvoicePreview;