import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, Save, BookOpen } from 'lucide-react';
import { uploadToLedger } from '../../../../shared/utils/api';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';

function FinalizeStep({ formData, onUploadInvoiceData, savedInvoiceData, isUploadingInvoice, availableCertificates, savedReceiptData }) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizationStatus, setFinalizationStatus] = useState(''); // 'invoice_uploaded', 'ledger_uploaded', 'completed'
  const [certificateSelections, setCertificateSelections] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);

  // Load certificate selections from database
  const loadCertificateSelections = async () => {
    setLoadingCertificates(true);
    try {
      const response = await fetch('http://localhost:5000/certificate/get-certificate-selections-for-receipt');
      if (response.ok) {
        const result = await response.json();
        setCertificateSelections(result.data || []);
      } else {
        console.error('Failed to load certificate selections');
        setCertificateSelections([]);
      }
    } catch (error) {
      console.error('Error loading certificate selections:', error);
      setCertificateSelections([]);
    } finally {
      setLoadingCertificates(false);
    }
  };

  // Load certificate selections on component mount
  useEffect(() => {
    loadCertificateSelections();
  }, []);

  // Check if invoice data is already saved and set status accordingly
  useEffect(() => {
    if (savedInvoiceData) {
      setFinalizationStatus('completed');
    }
  }, [savedInvoiceData]);

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amountReceived) || 0;
    if (formData.applyGST) {
      return amount + (amount * 0.18);
    }
    return amount;
  };

  const handleUploadInvoiceData = async () => {
    if (savedInvoiceData) {
      // Data already saved, show message
      return;
    }

    // Validate required fields before upload
    const errors = [];
    if (!formData.invoiceNumber) errors.push('Invoice Number is required');
    if (!formData.companyName) errors.push('Company Name is required');
    if (!formData.companyAccountNumber) errors.push('Company Account Number is required');
    if (!formData.selectedCourses || formData.selectedCourses.length === 0) {
      errors.push('At least one course must be selected');
    }

    if (errors.length > 0) {
      alert(`Please fix the following errors before uploading:\n${errors.join('\n')}`);
      return;
    }

    try {
      await onUploadInvoiceData();
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  const handleUploadToLedger = async () => {
    try {
      // Group certificates by candidate for better formatting
      const groupedByCandidate = {};

      formData.selectedCourses.forEach(courseId => {
        // Find the candidate that contains this certificate ID
        const candidate = certificateSelections?.find(candidate =>
          candidate.certificates && candidate.certificates.some(cert => cert.id == courseId)
        );

        if (candidate) {
          // Find the specific certificate within the candidate's certificates
          const certificate = candidate.certificates.find(cert => cert.id == courseId);
          if (certificate) {
            const candidateId = candidate.candidate_id;
            if (!groupedByCandidate[candidateId]) {
              // Clean candidate name: remove underscores and extract main name parts
              const cleanCandidateName = candidate.candidate_name
                .replace(/_/g, ' ')
                .split(' ')
                .slice(0, 2) // Take first two parts (first name + last name)
                .join(' ')
                .toUpperCase();

              groupedByCandidate[candidateId] = {
                name: cleanCandidateName,
                certificates: []
              };
            }
            groupedByCandidate[candidateId].certificates.push(certificate.certificate_name);
          }
        }
      });

      // Format particulars: "CANDIDATE NAME (CERT1, CERT2)"
      const particulars = Object.values(groupedByCandidate)
        .map(group => `${group.name} (${group.certificates.join(', ')})`)
        .join(', ');

      // If no particulars from courses, use customer name
      const finalParticulars = particulars || `Sales to ${formData.customerType === 'B2B' ? (formData.selectedB2BCustomerName || 'B2B Customer') : (formData.b2cFullName || 'B2C Customer')}`;

      // Calculate final amount
      const finalAmount = calculateFinalAmount();

      const ledgerData = {
        company_name: formData.partyName, // Use the customer name from the form
        date: formData.dateReceived,
        particulars: finalParticulars,
        voucher_no: formData.invoiceNumber,
        debit: finalAmount,
        credit: 0, // Assuming debit entry
        voucher_type: 'Sales'
      };

      await uploadToLedger(ledgerData);
      setFinalizationStatus('ledger_uploaded');
      toast.success('✓ Data uploaded to ledger successfully!');
    } catch (error) {
      console.error('Error uploading to ledger:', error);
      toast.error(`Error uploading to ledger: ${error.message}`);
      throw error;
    }
  };

  // Generate invoice PDF and convert to base64
  const generateInvoicePDF = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        // Prepare invoice data (reuse logic from PreviewDownloadStep)
        let resolvedCourses = [];
        if (formData.selectedCourses && formData.selectedCourses.length > 0) {
          try {
            const response = await fetch('http://localhost:5000/certificate/get-certificate-selections-for-receipt');
            if (response.ok) {
              const result = await response.json();
              const certificateSelections = result.data || [];

              // Resolve courses using the same logic as handleUploadToLedger
              resolvedCourses = formData.selectedCourses.map(courseId => {
                // Find the candidate that contains this certificate ID
                const candidate = certificateSelections.find(candidate =>
                  candidate.certificates && candidate.certificates.some(cert => cert.id == courseId)
                );

                if (candidate) {
                  // Find the specific certificate within the candidate's certificates
                  const certificate = candidate.certificates.find(cert => cert.id == courseId);
                  if (certificate) {
                    return {
                      id: certificate.id,
                      certificate_name: certificate.certificate_name,
                      candidate_name: candidate.candidate_name,
                      candidate_id: candidate.candidate_id,
                      creation_date: certificate.creation_date
                    };
                  }
                }
                return null;
              }).filter(Boolean);
            }
          } catch (error) {
            console.warn('Failed to resolve selected courses:', error);
            resolvedCourses = [];
          }
        }

        const invoiceData = {
          // Company Details
          companyName: formData.companyName || '',
          companyAddress: formData.companyAddress || '',
          companyGST: formData.gstNumber || '',
          companyStateCode: formData.stateCode || '',

          // Bank Details
          bankDetails: {
            bankName: formData.bankName || '',
            accountNumber: formData.companyAccountNumber || '',
            branch: formData.branch || '',
            ifscCode: formData.ifscCode || '',
            swiftCode: formData.swiftCode || '',
            accountHolderName: formData.accountHolderName || ''
          },

          // Customer Details
          customerType: formData.customerType || 'B2B',
          customerName: formData.customerType === 'B2B'
            ? (formData.selectedB2BCustomerName || formData.b2bCustomerAddress?.split(',')[0] || '')
            : formData.b2cFullName || '',
          customerAddress: formData.customerType === 'B2B'
            ? formData.b2bCustomerAddress || ''
            : `${formData.b2cAddress || ''}, ${formData.b2cCity || ''}, ${formData.b2cState || ''} - ${formData.b2cPincode || ''}`,
          customerGST: formData.customerType === 'B2B' ? formData.b2bCustomerGstNumber || '' : '',
          customerStateCode: formData.customerType === 'B2B' ? formData.b2bCustomerStateCode || '' : '',

          // Invoice Details
          invoiceNo: formData.invoiceNumber || 'AUTO-GENERATED',
          invoiceDate: formData.dateReceived || new Date().toLocaleDateString('en-GB'),

          // Optional Reference Fields
          deliveryNote: formData.deliveryNote || '',
          referenceNo: formData.referenceNo || '',
          otherReferences: formData.otherReferences || '',
          dispatchDocNo: formData.dispatchDocNo || '',
          deliveryNoteDate: formData.deliveryNoteDate || formData.dateReceived || '',
          dispatchedThrough: formData.dispatchedThrough || '',
          destination: formData.destination || '',
          modeOfPayment: formData.modeOfPayment || '',
          buyerOrderNo: formData.buyerOrderNo || '',

          // Financial Details
          amountReceived: parseFloat(formData.amountReceived) || 0,
          applyGST: formData.applyGST || false,
          finalAmount: calculateFinalAmount(),

          // Selected Courses
          selectedCourses: formData.selectedCourses || [],
          selected_courses_resolved: resolvedCourses,
          availableCertificates: []
        };

        // Create a temporary invoice element that exactly matches InvoicePreview.jsx structure
        const invoiceElement = document.createElement('div');
        invoiceElement.innerHTML = `
          <div style="padding: 16px; background-color: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
            <!-- Tax Invoice Header -->
            <div style="text-align: center; margin-bottom: 8px; background-color: white; padding-left: 16px; padding-right: 16px; padding-top: 8px; padding-bottom: 8px;">
              <h1 style="font-size: 30px; font-weight: 700; color: rgb(31 41 55); letter-spacing: 0.025em; margin: 0;">TAX INVOICE</h1>
            </div>

            <!-- Top Section with Company/Buyer and Invoice Details -->
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-bottom: 16px;">
              <!-- Left Side - Company and Customer Details -->
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- Company Details Section -->
                <div>
                  <h2 style="font-size: 14px; font-weight: 700; color: rgb(31 41 55); margin-bottom: 4px;">${invoiceData.companyName}</h2>
                  <div style="font-size: 12px; color: rgb(55 65 81); line-height: 1.25;">
                    ${invoiceData.companyAddress.split('\n').map(line => `<div>${line}</div>`).join('')}
                  </div>
                  <div style="font-size: 12px; margin-top: 4px;">
                    <strong>GSTIN/UIN:</strong> ${invoiceData.companyGST}
                  </div>
                  <div style="font-size: 12px;">
                    <strong>State Code:</strong> ${invoiceData.companyStateCode}
                  </div>
                </div>

                <!-- Separator Line -->
                <div style="border-top-width: 1px; border-color: rgb(156 163 175); margin-top: 8px; margin-bottom: 8px;"></div>

                <!-- Customer Details Section -->
                <div>
                  <h3 style="font-size: 14px; font-weight: 700; color: rgb(31 41 55); margin-bottom: 4px;">Customer (Bill to)</h3>
                  <div style="font-size: 12px; font-weight: 600; color: rgb(31 41 55); margin-bottom: 4px;">${invoiceData.customerName}</div>
                  <div style="font-size: 12px; color: rgb(55 65 81); line-height: 1.25; margin-bottom: 4px;">
                    ${invoiceData.customerAddress.split('\n').map(line => `<div>${line}</div>`).join('')}
                  </div>
                  ${invoiceData.customerGST ? `<div style="font-size: 12px; margin-bottom: 4px;"><strong>GSTIN/UIN:</strong> ${invoiceData.customerGST}</div>` : ''}
                  ${invoiceData.customerStateCode ? `<div style="font-size: 12px;"><strong>State Code:</strong> ${invoiceData.customerStateCode}</div>` : ''}
                </div>
              </div>

              <!-- Right Side - Invoice Details -->
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;">
                <!-- Left Column - Invoice Details -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="font-size: 12px;">
                    <strong>Receipt No.</strong><br />
                    <span style="color: rgb(55 65 81);">${invoiceData.invoiceNo}</span>
                  </div>
                  ${invoiceData.deliveryNote ? `<div style="font-size: 12px;"><strong>Delivery Note:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.deliveryNote}</span></div>` : ''}
                  ${invoiceData.referenceNo ? `<div style="font-size: 12px;"><strong>Reference No & Date:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.referenceNo}</span></div>` : ''}
                  ${invoiceData.buyerOrderNo ? `<div style="font-size: 12px;"><strong>Buyer's Order No:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.buyerOrderNo}</span></div>` : ''}
                  ${invoiceData.dispatchDocNo ? `<div style="font-size: 12px;"><strong>Dispatch Doc No:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.dispatchDocNo}</span></div>` : ''}
                  ${invoiceData.deliveryNoteDate ? `<div style="font-size: 12px;"><strong>Delivery Note Date:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.deliveryNoteDate}</span></div>` : ''}
                </div>

                <!-- Right Column - Invoice Details -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="font-size: 12px;">
                    <strong>Dated</strong><br />
                    <span style="color: rgb(55 65 81);">${invoiceData.invoiceDate}</span>
                  </div>
                  ${invoiceData.dispatchedThrough ? `<div style="font-size: 12px;"><strong>Dispatched through:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.dispatchedThrough}</span></div>` : ''}
                  ${invoiceData.modeOfPayment ? `<div style="font-size: 12px;"><strong>Mode/Terms of Payment:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.modeOfPayment}</span></div>` : ''}
                  ${invoiceData.otherReferences ? `<div style="font-size: 12px;"><strong>Other References:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.otherReferences}</span></div>` : ''}
                  ${invoiceData.destination ? `<div style="font-size: 12px;"><strong>Destination:</strong><br /><span style="color: rgb(55 65 81);">${invoiceData.destination}</span></div>` : ''}
                </div>
              </div>
            </div>

            <!-- Particulars Section -->
            <div style="margin-bottom: 16px;">
              <table style="width: 100%; border-collapse: collapse; border-width: 1px; border-color: rgb(156 163 175); font-size: 12px;">
                <thead>
                  <tr>
                    <th style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: center; width: 48px;">Sl No.</th>
                    <th style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: left;">Particulars</th>
                    <th style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: center; width: 80px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: center;">1</td>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px;">
                      <div style="white-space: pre-line; font-size: 12px;">${generateInvoiceHTML(invoiceData)}</div>
                    </td>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: right;">
                      <span style="font-size: 12px;">₹${invoiceData.amountReceived.toLocaleString()}</span>
                    </td>
                  </tr>

                  <!-- Total Amount Row -->
                  <tr style="background-color: rgb(249 250 251);">
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: right; font-weight: 600; font-size: 12px;" colSpan="2">
                      Total Amount
                    </td>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: right; font-weight: 600; font-size: 12px;">₹${invoiceData.amountReceived.toLocaleString()}</td>
                  </tr>

                  <!-- GST Rows -->
                  ${invoiceData.applyGST ? `
                  <tr>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: right; font-weight: 600; font-size: 12px;" colSpan="2">
                      CGST 9%
                    </td>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: right; font-size: 12px;">₹${(invoiceData.finalAmount * 0.09).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: right; font-weight: 600; font-size: 12px;" colSpan="2">
                      SGST 9%
                    </td>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; text-align: right; font-size: 12px;">₹${(invoiceData.finalAmount * 0.09).toFixed(2)}</td>
                  </tr>
                  ` : ''}

                  <tr style="background-color: rgb(243 244 246);">
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; font-weight: 700; text-align: right; font-size: 12px;" colSpan="2">
                      Total
                    </td>
                    <td style="border-width: 1px; border-color: rgb(156 163 175); padding: 4px; font-weight: 700; text-align: right; font-size: 12px;">₹${invoiceData.finalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Amount in Words -->
            <div style="margin-bottom: 12px; font-size: 12px;">
              <strong>Amount Chargeable (in words)</strong> E. & O.E<br />
              <div style="margin-top: 4px;">
                <strong>Total Amount: ₹${invoiceData.finalAmount.toLocaleString()}</strong><br />
                ${numberToWords(invoiceData.finalAmount)}
              </div>
            </div>

            <!-- Separator Line -->
            <div style="border-top-width: 1px; border-color: rgb(156 163 175); margin-top: 8px; margin-bottom: 8px;"></div>

            <!-- Bank Details -->
            ${invoiceData.bankDetails && (invoiceData.bankDetails.bankName || invoiceData.bankDetails.accountNumber) ? `
            <div style="margin-bottom: 12px;">
              <h3 style="font-size: 14px; font-weight: 700; color: rgb(31 41 55); margin-bottom: 8px;">Company's Bank Details</h3>
              <div style="font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
                ${invoiceData.bankDetails.accountHolderName ? `<div><strong>A/c Holder's Name:</strong><br />${invoiceData.bankDetails.accountHolderName}</div>` : ''}
                ${invoiceData.bankDetails.bankName ? `<div><strong>Bank Name:</strong><br />${invoiceData.bankDetails.bankName}${invoiceData.bankDetails.accountNumber ? ` - ${invoiceData.bankDetails.accountNumber.slice(-7)}` : ''}</div>` : ''}
                ${invoiceData.bankDetails.accountNumber ? `<div><strong>A/c No.:</strong><br />${invoiceData.bankDetails.accountNumber}</div>` : ''}
                ${invoiceData.bankDetails.branch && invoiceData.bankDetails.ifscCode ? `<div><strong>Branch & IFS Code:</strong><br />${invoiceData.bankDetails.branch} & ${invoiceData.bankDetails.ifscCode}</div>` : ''}
                ${invoiceData.bankDetails.swiftCode ? `<div><strong>SWIFT Code:</strong><br />${invoiceData.bankDetails.swiftCode}</div>` : ''}
              </div>
            </div>
            ` : ''}

            <!-- Signature Section -->
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-top: 24px;">
              <div style="text-align: center;">
                <div style="border-bottom-width: 1px; border-color: rgb(156 163 175); padding-bottom: 32px; margin-bottom: 4px;"></div>
                <strong style="font-size: 12px;">Customer's Seal and Signature</strong>
              </div>
              <div style="text-align: center;">
                <div style="border-bottom-width: 1px; border-color: rgb(156 163 175); padding-bottom: 32px; margin-bottom: 4px;"></div>
                <strong style="font-size: 12px;">for ${invoiceData.companyName}</strong><br />
                <strong style="font-size: 12px;">Authorised Signatory</strong>
              </div>
            </div>
          </div>
        `;

        // Apply exact styling to match InvoicePreview.jsx - center the content and prevent cutoff
        invoiceElement.style.width = '210mm';
        invoiceElement.style.maxWidth = '210mm'; // Prevent overflow
        invoiceElement.style.padding = '10mm';
        invoiceElement.style.backgroundColor = 'white';
        invoiceElement.style.fontFamily = 'Arial, sans-serif';
        invoiceElement.style.fontSize = '12px';
        invoiceElement.style.lineHeight = '1.4';
        invoiceElement.style.boxSizing = 'border-box';
        invoiceElement.style.margin = '0 auto'; // Center horizontally
        invoiceElement.style.display = 'block';
        invoiceElement.style.position = 'relative';
        invoiceElement.style.left = '0'; // Ensure left alignment within centered container

        // Configure html2pdf options to match InvoicePreview.jsx exactly and prevent cutoff
        const opt = {
          margin: 0.19685, // 5mm in inches
          filename: `Tax_Invoice_${formData.invoiceNumber || 'N/A'}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: {
            scale: 2.5,
            useCORS: true,
            letterRendering: true,
            allowTaint: false,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          }
        };

        // Generate PDF as base64
        html2pdf().set(opt).from(invoiceElement).outputPdf('datauristring').then((pdfBase64) => {
          // Extract base64 data from data URL
          const base64Data = pdfBase64.split(',')[1];
          resolve(base64Data);
        }).catch((error) => {
          console.error('PDF generation failed:', error);
          reject(error);
        });

      } catch (error) {
        console.error('Error generating invoice PDF:', error);
        reject(error);
      }
    });
  };

  // Generate invoice HTML (simplified version for PDF)
  const generateInvoiceHTML = (data) => {
    const formatSelectedCourses = () => {
      if (!data.selected_courses_resolved || data.selected_courses_resolved.length === 0) {
        return 'No certificates found for selected courses';
      }

      const groupedByCandidate = data.selected_courses_resolved.reduce((acc, course) => {
        const candidateName = course.candidate_name || 'Unknown Candidate';
        if (!acc[candidateName]) {
          acc[candidateName] = [];
        }
        acc[candidateName].push(course.certificate_name || 'Unknown Certificate');
        return acc;
      }, {});

      return Object.entries(groupedByCandidate)
        .map(([candidateName, certificates]) => {
          const cleanCandidateName = candidateName
            .replace(/_/g, ' ')
            .split(' ')
            .slice(0, 2)
            .join(' ')
            .toUpperCase();
          const certList = certificates.join(', ');
          return `${cleanCandidateName} (${certList})`;
        })
        .join('\n');
    };

    return formatSelectedCourses();
  };

  // Convert number to words
  const numberToWords = (num) => {
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let result = 'INR ' + convert(rupees);
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }
    result += ' Only';

    function convert(n) {
      if (n === 0) return 'Zero';
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

      let crore = Math.floor(n / 10000000);
      let lakh = Math.floor((n % 10000000) / 100000);
      let thousand = Math.floor((n % 100000) / 1000);
      let remainder = n % 1000;

      let result = '';
      if (crore > 0) result += ones[Math.floor(crore / 100)] + ' Crore ';
      if (lakh > 0) result += ones[Math.floor(lakh / 100)] + ' Lakh ';
      if (thousand > 0) result += ones[Math.floor(thousand / 100)] + ' Thousand ';
      if (remainder > 0) result += ones[Math.floor(remainder / 100)] + ' Hundred ';
      return result.trim();
    }

    return result;
  };

  const handleFinalizeAndUpload = async () => {
    if (isProcessingRef.current || isFinalizing) return;

    // Validate required fields before starting
    const errors = [];
    if (!formData.invoiceNumber) errors.push('Invoice Number is required');
    if (!formData.companyName) errors.push('Company Name is required');
    if (!formData.companyAccountNumber) errors.push('Company Account Number is required');
    if (!formData.selectedCourses || formData.selectedCourses.length === 0) {
      errors.push('At least one course must be selected');
    }

    if (errors.length > 0) {
      alert(`Please fix the following errors before finalizing:\n${errors.join('\n')}`);
      return;
    }

    // Immediately set processing flags
    isProcessingRef.current = true;
    setIsProcessing(true);
    setIsFinalizing(true);
    setFinalizationStatus('');

    try {
      // Step 1: Upload Invoice Data to receipt_invoice_data and master_database_table_a
      if (!savedInvoiceData) {
        await onUploadInvoiceData();
        setFinalizationStatus('invoice_uploaded');
        toast.success(`✓ Data uploaded successfully (Invoice: ${formData.invoiceNumber})`);
      } else {
        setFinalizationStatus('invoice_uploaded');
        toast.info('Invoice data already uploaded');
      }

      // Step 2: Generate and Save Invoice PDF
      try {
        const pdfBase64 = await generateInvoicePDF();

        const saveResponse = await fetch('http://localhost:5000/api/bookkeeping/save-invoice-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoice_no: formData.invoiceNumber,
            image_data: pdfBase64,
            image_type: 'pdf',
            file_name: `Tax_Invoice_${formData.invoiceNumber}.pdf`
          }),
        });

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json();
          console.log('Invoice PDF saved successfully:', saveResult);
          toast.success('✓ Invoice PDF saved successfully');
        } else {
          const errorText = await saveResponse.text();
          console.error('Failed to save invoice PDF:', errorText);
          toast.warning('⚠️ Invoice data saved but PDF generation failed');
        }
      } catch (pdfError) {
        console.error('Error generating/saving PDF:', pdfError);
        toast.warning('⚠️ Invoice data saved but PDF generation failed');
      }

      // Step 3: Upload to Ledger (sequential execution)
      await handleUploadToLedger();

      // Step 4: Update certificate status to "done" for finalized certificates
      try {
        // Find matching certificates in certificate_selections based on certificate_name, candidate_id, and candidate_name
        const updateResponse = await fetch('http://localhost:5000/certificate/update-certificate-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectedCourses: formData.selectedCourses,
            status: 'done'
          }),
        });

        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('Certificate status updated successfully:', updateResult);
          toast.success('✓ Certificate status updated to finalized');
        } else {
          const errorText = await updateResponse.text();
          console.error('Failed to update certificate status:', errorText);
          toast.warning('⚠️ Finalization completed but certificate status update failed');
        }
      } catch (statusError) {
        console.error('Error updating certificate status:', statusError);
        toast.warning('⚠️ Finalization completed but certificate status update failed');
      }

      setFinalizationStatus('completed');

    } catch (error) {
      console.error('Error during finalization:', error);
      // Error handling is done in individual functions
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Finalize & Upload</h3>
        <p className="text-gray-600">Review invoice details and upload data</p>
      </div>

      {/* Invoice Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Invoice Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Invoice Number:</p>
            <p className="font-medium">{formData.invoiceNumber || 'AUTO-GENERATED'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date:</p>
            <p className="font-medium">{formData.dateReceived || new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Company:</p>
            <p className="font-medium">{formData.companyName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer:</p>
            <p className="font-medium">
              {formData.customerType === 'B2B'
                ? (formData.selectedB2BCustomerName || 'B2B Customer')
                : (formData.b2cFullName || 'B2C Customer')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount:</p>
            <p className="font-medium">₹{(parseFloat(formData.amountReceived) || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Final Amount:</p>
            <p className="font-bold text-green-600">₹{calculateFinalAmount().toLocaleString()}</p>
          </div>
        </div>
      </div>


      {/* Finalize & Upload - Single Button Operation */}
      <div className="bg-white border-2 border-green-200 rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h4 className="text-xl font-bold text-gray-800 mb-3">Finalize & Upload</h4>
          <p className="text-gray-600 text-base mb-6">
            Trigger both operations with a single button press
          </p>

          {/* Status Display */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-4 h-4 rounded-full ${finalizationStatus === 'invoice_uploaded' || finalizationStatus === 'ledger_uploaded' || finalizationStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`text-sm ${finalizationStatus === 'invoice_uploaded' || finalizationStatus === 'ledger_uploaded' || finalizationStatus === 'completed' ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                {finalizationStatus === 'invoice_uploaded' || finalizationStatus === 'ledger_uploaded' || finalizationStatus === 'completed' ? 'Data Uploaded' : 'Data Upload'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className={`w-4 h-4 rounded-full ${finalizationStatus === 'ledger_uploaded' || finalizationStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`text-sm ${finalizationStatus === 'ledger_uploaded' || finalizationStatus === 'completed' ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                {finalizationStatus === 'ledger_uploaded' || finalizationStatus === 'completed' ? 'Uploaded to Ledger' : 'Upload to Ledger'}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinalizeAndUpload}
            disabled={isFinalizing || isProcessing || finalizationStatus === 'completed' || !!savedInvoiceData}
            className={`w-full py-4 px-6 rounded-xl transition-colors font-semibold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg ${
              isFinalizing || isProcessing || finalizationStatus === 'completed'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isFinalizing ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Finalizing...
              </>
            ) : finalizationStatus === 'completed' ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Finalized & Uploaded
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                Finalize & Upload
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

export default FinalizeStep;