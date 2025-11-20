export const VERIFICATION_FIELDS = {
  fullName: { x: 310, y: 158, fontSize: 16 },
  passport: { x: 310, y: 210, fontSize: 16 }
};

export const CERTIFICATE_FIELDS = {
  fullName: { x: 310, y: 158, fontSize: 16 },
  passport: { x: 310, y: 210, fontSize: 16 },
  nationality: { x: 120, y: 280, fontSize: 16 },
  dob: { x: 340, y: 280, fontSize: 16 },
  cdcNo: { x: 80, y: 320, fontSize: 16 }
};

export function generateCertificateFields(startDate, endDate, expiryYears) {
  // Validate date format (dd-mm-yyyy)
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(startDate)) {
    throw new Error("Invalid startDate format. Must be dd-mm-yyyy");
  }
  if (!dateRegex.test(endDate)) {
    throw new Error("Invalid endDate format. Must be dd-mm-yyyy");
  }

  // Validate expiryYears
  if (!Number.isInteger(expiryYears) || expiryYears <= 0) {
    throw new Error("expiryYears must be a positive integer");
  }

  // Parse dates from dd-mm-yyyy format
  function parseDate(str) {
    const [dd, mm, yyyy] = str.split('-').map(Number);
    return new Date(yyyy, mm - 1, dd);
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  // issueDate is identical to endDate
  const issueDate = endDate;

  // courseAttended formatted as "startDate to endDate"
  const courseAttended = `${startDate} to ${endDate}`;

  // expirationDate: add expiryYears to endDate, then subtract 1 day
  const expDate = new Date(end);
  expDate.setFullYear(expDate.getFullYear() + expiryYears);
  expDate.setDate(expDate.getDate() - 1);

  // Format back to dd-mm-yyyy
  function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  const expirationDate = formatDate(expDate);

  return {
    issueDate,
    courseAttended,
    expirationDate
  };
}

export const CERTIFICATE_CONFIG = {
  STCW: {
    name: 'Basic Safety Training (STCW)',
    backgroundImages: ['/static/BST VERIFICATION.jpg', '/static/angelmaritime1.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `BST_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  },
  STSDSD: {
    name: 'Security Training for Seafarers with Designated Security Duties (STSDSD)',
    backgroundImages: ['/static/STSDSD VERIFICATION.jpg', '/static/angelmaritime2.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `STSDSD_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  },
  H2S: {
    name: 'H2S Certificate',
    backgroundImages: ['/static/H2S VERIFICATION.jpg', '/static/angelmaritime3.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `H2S_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  },
  BOSIET: {
    name: 'Basic Offshore Safety Induction and Emergency Training (BOSIET)',
    backgroundImages: ['/static/BOSET VERIFICATION.jpg', '/static/angelmaritime4.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `BOSIET_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  },
  BTM: {
    name: 'BTM Training Certificate',
    backgroundImages: ['/static/BTM_Verification.jpg', '/static/BTM_page.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `BTM_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  },
  FHFS: {
    name: 'FH&FS Training Certificate',
    backgroundImages: ['/static/FH&FS_Verification.jpg', '/static/FH&FS_page.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `FHFS_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  },
  HLO: {
    name: 'HLO Training Certificate',
    backgroundImages: ['/static/HLO_Verification.jpg', '/static/HLO_page.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `HLO_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  },
  LCHS: {
    name: 'LCHS Training Certificate',
    backgroundImages: ['/static/LCHC-CHEMICAL_Verification.jpg', '/static/LCHS-CHEMICAL_page.jpg'],
    dimensions: { width: 595, height: 842 },
    verificationFields: VERIFICATION_FIELDS,
    certificateFields: CERTIFICATE_FIELDS,
    generateName: (data) => `LCHS_${data.date || 'NO_DATE'}_${data.passport || 'NO_PASSPORT'}`
  }
};