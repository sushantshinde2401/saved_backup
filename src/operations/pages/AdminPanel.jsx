import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  User,
  Image as ImageIcon,
  Edit,
  Save,
  ArrowLeft,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ZoomIn,
  FileText
} from 'lucide-react';

function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Main panel state
  const [candidateName, setCandidateName] = useState('');
  const [candidateData, setCandidateData] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  // Candidates dropdown state
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  // Combined data state
  const [combinedData, setCombinedData] = useState(null);
  const [selectedCandidateName, setSelectedCandidateName] = useState('');

  // Invoice images state
  const [invoiceImages, setInvoiceImages] = useState([]);
  const [isLoadingInvoiceImages, setIsLoadingInvoiceImages] = useState(false);

  // Image viewer state
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: '',
    imageTitle: ''
  });

  // Authentication
  const handleAuth = () => {
    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
      // Load candidates after authentication
      loadCandidates();
    } else {
      setAuthError('Invalid password');
    }
  };

  // Security: Clear sensitive data on logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setAuthError('');
    setCandidateData(null);
    setCombinedData(null);
    setImages([]);
    setInvoiceImages([]);
    setSelectedCandidateId('');
    setSelectedCandidateName('');
    setError('');
    setCandidates([]);
  };

  // Load all candidates for dropdown
  const loadCandidates = useCallback(async () => {
    setIsLoadingCandidates(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/candidate/get-unique-candidate-names');
      const result = await response.json();

      if (result.status === 'success') {
        // Transform to match existing format
        const candidateOptions = result.data.map((name, index) => ({
          id: index + 1,
          candidate_name: name
        }));
        setCandidates(candidateOptions);
        if (candidateOptions.length === 0) {
          setError('No candidates found in the database');
        } else {
          setError(''); // Clear any previous error if candidates are found
        }
      } else {
        setError('Failed to load candidates');
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setError(`Failed to load candidates from database: ${err.message || 'Network error'}`);
    } finally {
      setIsLoadingCandidates(false);
    }
  }, []);

  // Auto-refresh candidates every 30 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCandidates();

      const interval = setInterval(() => {
        loadCandidates();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadCandidates]);

  // Security: Clear data when component unmounts
  useEffect(() => {
    return () => {
      setCandidateData(null);
      setCombinedData(null);
      setImages([]);
      setInvoiceImages([]);
      setSelectedCandidateId('');
      setSelectedCandidateName('');
      setError('');
      setImageViewer({ isOpen: false, imageSrc: '', imageAlt: '', imageTitle: '' });
    };
  }, []);

  // Keyboard handler for ESC key to close image viewer
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && imageViewer.isOpen) {
        closeImageViewer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageViewer.isOpen]);

  // Image viewer functions
  const openImageViewer = (imageSrc, imageAlt, imageTitle) => {
    setImageViewer({
      isOpen: true,
      imageSrc,
      imageAlt,
      imageTitle
    });
  };

  const closeImageViewer = () => {
    setImageViewer({
      isOpen: false,
      imageSrc: '',
      imageAlt: '',
      imageTitle: ''
    });
  };

  // Search candidate
  const handleSearch = async () => {
    if (!candidateName.trim()) {
      setError('Please enter a candidate name');
      return;
    }

    setIsLoading(true);
    setError('');
    setCandidateData(null);
    setImages([]);

    try {
      // First try searching by candidate_name (full name)
      const searchResponse = await fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(candidateName)}&field=candidate_name`);
      const searchResult = await searchResponse.json();

      if (searchResult.status === 'success' && searchResult.data && searchResult.data.length > 0) {
        const candidate = searchResult.data[0];
        setCandidateData({
          id: candidate.id,
          ...candidate.candidate_data
        });
        setEditedData(candidate.candidate_data || {});
        await loadCandidateImages(candidate.candidate_name);
        return;
      }

      // Try searching by firstName
      const searchResponse2 = await fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(candidateName)}&field=firstName`);
      const searchResult2 = await searchResponse2.json();

      if (searchResult2.status === 'success' && searchResult2.data && searchResult2.data.length > 0) {
        const candidate = searchResult2.data[0];
        setCandidateData({
          id: candidate.id,
          ...candidate.candidate_data
        });
        setEditedData(candidate.candidate_data || {});
        await loadCandidateImages(candidate.candidate_name);
        return;
      }

      // Try searching by lastName
      const searchResponse3 = await fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(candidateName)}&field=lastName`);
      const searchResult3 = await searchResponse3.json();

      if (searchResult3.status === 'success' && searchResult3.data && searchResult3.data.length > 0) {
        const candidate = searchResult3.data[0];
        setCandidateData({
          id: candidate.id,
          ...candidate.candidate_data
        });
        setEditedData(candidate.candidate_data || {});
        await loadCandidateImages(candidate.candidate_name);
      } else {
        setError('Candidate not found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search candidate');
    } finally {
      setIsLoading(false);
    }
  };

  // Load candidate images
  const loadCandidateImages = async (candidateName) => {
    try {
      // Get all candidates to find files
      const response = await fetch('http://127.0.0.1:5000/candidate/get-all-candidates');
      const result = await response.json();

      if (result.status === 'success') {
        const candidate = result.data.find(c => c.candidate_name === candidateName);
        if (candidate && candidate.files) {
          const imageFiles = candidate.files.filter(file =>
            file.file_type && ['jpg', 'jpeg', 'png', 'gif'].includes(file.file_type.toLowerCase())
          );
          setImages(imageFiles);
        }
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  };

  // Load invoice images for candidate
  const loadInvoiceImages = async (candidateName) => {
    setIsLoadingInvoiceImages(true);
    try {
      // First get master data to find invoice numbers for this candidate
      const masterResponse = await fetch(`http://127.0.0.1:5000/candidate/get-combined-candidate-data/${encodeURIComponent(candidateName)}`);
      const masterResult = await masterResponse.json();

      if (masterResult.status === 'success' && masterResult.data.master_data && masterResult.data.master_data.length > 0) {
        // Get all invoice numbers for this candidate
        const invoiceNumbers = masterResult.data.master_data
          .map(record => record.invoice_no)
          .filter(invoiceNo => invoiceNo && invoiceNo !== 'N/A');

        if (invoiceNumbers.length > 0) {
          // Load invoice images for each invoice number
          const invoiceImagesPromises = invoiceNumbers.map(async (invoiceNo) => {
            try {
              const imageResponse = await fetch(`http://127.0.0.1:5000/api/bookkeeping/get-invoice-image/${encodeURIComponent(invoiceNo)}`);
              if (imageResponse.ok) {
                const imageResult = await imageResponse.json();

                if (imageResult.status === 'success') {
                  return {
                    ...imageResult.data,
                    candidate_name: candidateName,
                    master_record: masterResult.data.master_data.find(record => record.invoice_no === invoiceNo)
                  };
                }
              } else if (imageResponse.status === 404) {
                // Invoice image not found - return placeholder object (expected for not yet generated)
                return {
                  invoice_no: invoiceNo,
                  noImage: true,
                  candidate_name: candidateName,
                  master_record: masterResult.data.master_data.find(record => record.invoice_no === invoiceNo)
                };
              } else {
                console.warn(`Unexpected response for invoice ${invoiceNo}: ${imageResponse.status}`);
              }
            } catch (error) {
              console.warn(`Failed to load invoice image for ${invoiceNo}:`, error.message);
            }
            return null;
          });

          const loadedImages = (await Promise.all(invoiceImagesPromises)).filter(Boolean);
          setInvoiceImages(loadedImages);
        } else {
          setInvoiceImages([]);
        }
      } else {
        setInvoiceImages([]);
      }
    } catch (err) {
      console.error('Failed to load invoice images:', err.message);
      setInvoiceImages([]);
    } finally {
      setIsLoadingInvoiceImages(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!candidateData) return;

    setIsLoading(true);
    try {
      // Update candidate data in database
      const response = await fetch('http://127.0.0.1:5000/candidate/update-candidate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: candidateData.id,
          ...editedData,
          last_updated: new Date().toISOString()
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        setCandidateData(editedData);
        setIsEditing(false);
        setError('');
      } else {
        setError(result.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(`Failed to save changes: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle candidate selection from dropdown
  const handleCandidateSelect = async (candidateId) => {
    if (!candidateId) {
      setSelectedCandidateId('');
      setSelectedCandidateName('');
      setCandidateData(null);
      setCombinedData(null);
      setImages([]);
      setInvoiceImages([]);
      setError('');
      return;
    }

    setSelectedCandidateId(candidateId);
    setIsLoading(true);
    setError('');
    setCandidateData(null);
    setCombinedData(null);
    setImages([]);
    setInvoiceImages([]);

    try {
      const candidate = candidates.find(c => c.id.toString() === candidateId);
      if (candidate) {
        const candidateName = candidate.candidate_name;
        setSelectedCandidateName(candidateName);

        // Load combined data from all sources
        const response = await fetch(`http://127.0.0.1:5000/candidate/get-combined-candidate-data/${encodeURIComponent(candidateName)}`);
        const result = await response.json();

        if (result.status === 'success') {
          setCombinedData(result.data);

          // Set basic candidate data for editing
          if (result.data.candidate_info) {
            setCandidateData({
              id: result.data.candidate_info.id,
              ...result.data.candidate_info.json_data
            });
            setEditedData(result.data.candidate_info.json_data || {});
          }

          // Load images from uploads
          if (result.data.uploads && result.data.uploads.length > 0) {
            const imageFiles = result.data.uploads.filter(upload =>
              upload.file_type && ['jpg', 'jpeg', 'png', 'gif'].includes(upload.file_type.toLowerCase())
            ).map(upload => ({
              id: upload.id,
              file_name: upload.file_name,
              file_type: upload.file_type,
              mime_type: upload.mime_type,
              file_size: upload.file_size,
              image_num: 1, // Will be set properly when displaying
              upload_time: upload.upload_time
            }));
            setImages(imageFiles);
          }

          // Load invoice images (don't await - let it run in background)
          loadInvoiceImages(candidateName);
        } else {
          setError(result.message || 'Failed to load combined candidate data');
        }
      } else {
        setError('Selected candidate not found');
      }
    } catch (err) {
      console.error('Failed to load candidate data:', err);
      setError(`Failed to load candidate data: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Access Required</h2>
            <p className="text-gray-600 mt-2">Enter admin password to continue</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />

            {authError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {authError}
              </div>
            )}

            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Access Admin Panel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Floating Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-6 left-6 z-50 flex gap-3"
      >
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className="group relative bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white p-3 rounded-full shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <ArrowLeft size={20} className="relative z-10" />
        </motion.button>

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-3 rounded-full shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <Lock size={20} className="relative z-10" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-red-100 to-orange-100 bg-clip-text text-transparent mb-4">
            Admin Panel
          </h1>
          <p className="text-red-200 opacity-80 max-w-2xl mx-auto">
            Search and manage candidate information and documents
          </p>
        </motion.div>

        {/* Candidate Selection Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Candidate
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => handleCandidateSelect(e.target.value)}
                  disabled={isLoadingCandidates}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingCandidates ? 'Loading candidates...' : 'Select a candidate'}
                  </option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.candidate_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Total candidates: {candidates.length}</span>
                <button
                  onClick={loadCandidates}
                  disabled={isLoadingCandidates}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs underline"
                >
                  {isLoadingCandidates ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Candidate Data Display */}
        {combinedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Data Sources Summary */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Data Sources Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{combinedData.data_sources.master_table_records}</div>
                  <div className="text-sm text-gray-600">Master Table Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{combinedData.data_sources.upload_files}</div>
                  <div className="text-sm text-gray-600">Uploaded Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{combinedData.data_sources.certificate_records}</div>
                  <div className="text-sm text-gray-600">Certificate Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{combinedData.data_sources.has_candidate_info ? '1' : '0'}</div>
                  <div className="text-sm text-gray-600">Candidate Info</div>
                </div>
              </div>
            </div>

            {/* Master Database Table A Data */}
            {combinedData.master_data && combinedData.master_data.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                  <Shield size={24} />
                  Master Database Records
                </h2>
                <div className="space-y-4">
                  {combinedData.master_data.map((record, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><strong>Creation Date:</strong> {record.creation_date ? new Date(record.creation_date).toISOString().slice(0, 19).replace('T', ' ') : 'Not Available'}</div>
                        <div><strong>Client Name:</strong> {record.client_name || 'N/A'}</div>
                        <div><strong>Client ID:</strong> {record.client_id || 'N/A'}</div>
                        <div><strong>Candidate ID:</strong> {record.candidate_id || 'N/A'}</div>
                        <div><strong>Candidate Name:</strong> {record.candidate_name || 'N/A'}</div>
                        <div><strong>Nationality:</strong> {record.nationality || 'N/A'}</div>
                        <div><strong>Passport:</strong> {record.passport || 'N/A'}</div>
                        <div><strong>CDC No:</strong> {record.cdcno || 'N/A'}</div>
                        <div><strong>INDOS No:</strong> {record.indosno || 'N/A'}</div>
                        <div><strong>Certificate Name:</strong> {record.certificate_name || 'N/A'}</div>
                        <div><strong>Certificate ID:</strong> {record.certificate_id || 'N/A'}</div>
                        <div><strong>Company Name:</strong> {record.companyname || 'N/A'}</div>
                        <div><strong>Person in Charge:</strong> {record.person_in_charge || 'N/A'}</div>
                        <div><strong>Delivery Note:</strong> {record.delivery_note || 'N/A'}</div>
                        <div><strong>Delivery Date:</strong> {record.delivery_date ? new Date(record.delivery_date).toISOString().slice(0, 19).replace('T', ' ') : 'Not Available'}</div>
                        <div><strong>Terms of Delivery:</strong> {record.terms_of_delivery || 'N/A'}</div>
                        <div><strong>Invoice No:</strong> {record.invoice_no || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Selections */}
            {combinedData.certificates && combinedData.certificates.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                  <CheckCircle size={24} />
                  Certificate Records
                </h2>
                <div className="space-y-4">
                  {combinedData.certificates.map((cert, index) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>Certificate:</strong> {cert.certificate_name}</div>
                        <div><strong>Client:</strong> {cert.client_name}</div>
                        <div><strong>Created:</strong> {new Date(cert.creation_date).toLocaleDateString()}</div>
                        <div><strong>Images:</strong>
                          {cert.has_verification_image && <span className="text-green-600 ml-2">✓ Verification</span>}
                          {cert.has_certificate_image && <span className="text-green-600 ml-2">✓ Certificate</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Information */}
            {candidateData && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <User size={24} />
                    Candidate Information
                  </h2>
                  <div className="flex gap-3">
                    {!isEditing ? (
                      <motion.button
                        onClick={handleEdit}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handleSave}
                        disabled={isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(isEditing ? editedData : candidateData).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="block font-semibold text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </label>
                      {isEditing ? (
                          typeof value === 'object' && value !== null ? (
                            <textarea
                              value={JSON.stringify(value, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  handleInputChange(key, parsed);
                                } catch {
                                  // If invalid JSON, store as string for now
                                  handleInputChange(key, e.target.value);
                                }
                              }}
                              rows={4}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                              placeholder="JSON data"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value || ''}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          )
                        ) : (
                         <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                           {typeof value === 'object' && value !== null
                             ? JSON.stringify(value, null, 2)
                             : (value || 'N/A')
                           }
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Section */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                  <ImageIcon size={24} />
                  Uploaded Images ({images.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="group relative"
                    >
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg cursor-pointer group-hover:shadow-xl transition-shadow duration-300 relative">
                        <img
                          src={`http://127.0.0.1:5000/candidate/download-image/${image.id}`}
                          alt={image.file_name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onClick={() => openImageViewer(`http://127.0.0.1:5000/candidate/download-image/${image.id}`, image.file_name, `Uploaded Image: ${image.file_name}`)}
                          onError={(e) => {
                            console.error('Image failed to load:', image.id, image.file_name);
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'flex';
                            }
                          }}
                          style={{ imageRendering: 'auto' }}
                        />
                        <div className="hidden w-full h-full items-center justify-center text-gray-500 text-sm bg-gray-100">
                          <div className="text-center">
                            <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                            Image not available
                          </div>
                        </div>
                        {/* Zoom indicator */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <ZoomIn size={32} className="text-white drop-shadow-lg" />
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        <div className="font-medium">{image.file_name}</div>
                        <div className="text-xs text-gray-500">
                          {image.file_type?.toUpperCase()} • {(image.file_size / 1024).toFixed(1)} KB
                        </div>
                        {image.upload_time && (
                          <div className="text-xs text-gray-500">
                            {new Date(image.upload_time).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Invoice Images Section */}
            {invoiceImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                  <FileText size={24} />
                  Invoice Images ({invoiceImages.length})
                  {isLoadingInvoiceImages && <Loader2 className="animate-spin" size={20} />}
                </h3>

                <div className="space-y-6">
                  {invoiceImages.map((invoiceImage, index) => (
                    <motion.div
                      key={invoiceImage.id || invoiceImage.invoice_no}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-2">
                            Invoice: {invoiceImage.invoice_no}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            {invoiceImage.noImage ? (
                              <div className="col-span-4 text-orange-600 font-medium">
                                <strong>Status:</strong> No invoice image available
                              </div>
                            ) : (
                              <>
                                <div><strong>Generated:</strong> {new Date(invoiceImage.generated_at).toLocaleDateString()}</div>
                                <div><strong>Size:</strong> {(invoiceImage.file_size / 1024).toFixed(1)} KB</div>
                                <div><strong>Type:</strong> {invoiceImage.image_type.toUpperCase()}</div>
                                <div><strong>Client:</strong> {invoiceImage.master_record?.client_name || 'N/A'}</div>
                              </>
                            )}
                          </div>
                        </div>
                        {!invoiceImage.noImage && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openImageViewer(
                                `data:application/pdf;base64,${invoiceImage.image_data}`,
                                `Invoice ${invoiceImage.invoice_no}`,
                                `Tax Invoice - ${invoiceImage.invoice_no}`
                              )}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                              <ZoomIn size={16} />
                              View PDF
                            </button>
                            <a
                              href={`data:application/pdf;base64,${invoiceImage.image_data}`}
                              download={invoiceImage.file_name}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                              <FileText size={16} />
                              Download
                            </a>
                          </div>
                        )}
                      </div>

                      {invoiceImage.noImage ? (
                        /* No Image Placeholder */
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg">
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <h5 className="font-semibold text-gray-800">Invoice Preview</h5>
                          </div>
                          <div className="p-4">
                            <div className="w-full h-96 flex items-center justify-center text-gray-500 text-sm bg-gray-100 rounded border-2 border-dashed border-gray-300">
                              <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-medium">No invoice image available</p>
                                <p className="text-xs">Invoice PDF has not been generated yet</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Invoice Preview */
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg">
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <h5 className="font-semibold text-gray-800">Invoice Preview</h5>
                          </div>
                          <div className="p-4">
                            <iframe
                              src={`data:application/pdf;base64,${invoiceImage.image_data}`}
                              className="w-full h-[600px] border-0 rounded"
                              title={`Invoice ${invoiceImage.invoice_no}`}
                              scrolling="yes"
                              onError={(e) => {
                                console.error('Invoice PDF failed to load:', invoiceImage.id);
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="hidden w-full h-[600px] items-center justify-center text-gray-500 text-sm bg-gray-100 rounded border-2 border-dashed border-gray-300">
                              <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                <p className="font-medium">Invoice PDF Preview</p>
                                <p className="text-xs">Click "View PDF" to open in full screen</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Related Master Data */}
                      {invoiceImage.master_record && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h6 className="font-semibold text-gray-700 mb-2">Related Information:</h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div><strong>Certificates:</strong> {invoiceImage.master_record.certificate_name}</div>
                            <div><strong>Company:</strong> {invoiceImage.master_record.companyName}</div>
                            <div><strong>Amount:</strong> ₹{invoiceImage.master_record.final_amount || 'N/A'}</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Certificate Images Section */}
            {combinedData && combinedData.certificates && combinedData.certificates.some(cert => cert.has_verification_image || cert.has_certificate_image) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20"
              >
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                  <Shield size={24} />
                  Certificate Images
                </h3>

                <div className="space-y-6">
                  {combinedData.certificates.filter(cert => cert.has_verification_image || cert.has_certificate_image).map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">{cert.certificate_name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cert.has_verification_image && (
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-2">Verification Image</div>
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg cursor-pointer group-hover:shadow-xl transition-shadow duration-300 relative group">
                              <img
                                src={`http://127.0.0.1:5000/certificate/verification-image/${cert.id}`}
                                alt={`Verification - ${cert.certificate_name}`}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onClick={() => openImageViewer(`http://127.0.0.1:5000/certificate/verification-image/${cert.id}`, `Verification - ${cert.certificate_name}`, `Verification Image: ${cert.certificate_name}`)}
                                onError={(e) => {
                                  console.error('Verification image failed to load:', cert.id, cert.certificate_name);
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                                style={{ imageRendering: 'auto' }}
                              />
                              <div className="hidden w-full h-full items-center justify-center text-gray-500 text-sm bg-gray-100">
                                <div className="text-center">
                                  <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                                  Image not available
                                </div>
                              </div>
                              {/* Zoom indicator */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <ZoomIn size={32} className="text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>
                        )}
                        {cert.has_certificate_image && (
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-2">Certificate Image</div>
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg cursor-pointer group-hover:shadow-xl transition-shadow duration-300 relative group">
                              <img
                                src={`http://127.0.0.1:5000/certificate/certificate-image/${cert.id}`}
                                alt={`Certificate - ${cert.certificate_name}`}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onClick={() => openImageViewer(`http://127.0.0.1:5000/certificate/certificate-image/${cert.id}`, `Certificate - ${cert.certificate_name}`, `Certificate Image: ${cert.certificate_name}`)}
                                onError={(e) => {
                                  console.error('Certificate image failed to load:', cert.id, cert.certificate_name);
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                                style={{ imageRendering: 'auto' }}
                              />
                              <div className="hidden w-full h-full items-center justify-center text-gray-500 text-sm bg-gray-100">
                                <div className="text-center">
                                  <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                                  Image not available
                                </div>
                              </div>
                              {/* Zoom indicator */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <ZoomIn size={32} className="text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* No Data Message */}
            {combinedData && !candidateData && images.length === 0 && combinedData.certificates.length === 0 && combinedData.master_data.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 text-center"
              >
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
                <p className="text-gray-500">No records found for this candidate in any of the data sources.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Full-Screen Image Viewer */}
        {imageViewer.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={closeImageViewer}
          >
            {/* Close button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-60 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200"
            >
              <X size={24} />
            </button>

            {/* Image */}
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={imageViewer.imageSrc}
              alt={imageViewer.imageAlt}
              className="max-w-full max-h-full object-contain"
              style={{
                imageRendering: 'auto',
                width: 'auto',
                height: 'auto',
                maxWidth: '95vw',
                maxHeight: '95vh'
              }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'flex';
                }
              }}
            />

            {/* Error fallback */}
            <div className="hidden w-full h-full items-center justify-center text-white text-xl bg-gray-900">
              <div className="text-center">
                <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                Image failed to load
              </div>
            </div>

            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
              Click anywhere or press ESC to close
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;