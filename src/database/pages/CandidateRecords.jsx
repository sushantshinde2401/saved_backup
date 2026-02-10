import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  ArrowLeft,
  FileText,
  Loader2,
  Edit,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  ZoomIn,
  User,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  Briefcase,
  Clock
} from 'lucide-react';

function CandidateRecords() {
  const navigate = useNavigate();

  // View switch state
  const [currentView, setCurrentView] = useState('candidates'); // 'candidates' or 'legacy'

  // Main data state
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [activeTab, setActiveTab] = useState('info');

  // Legacy certificates state
  const [legacySearchTerm, setLegacySearchTerm] = useState('');
  const [legacySearchResults, setLegacySearchResults] = useState([]);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacyError, setLegacyError] = useState('');
  const [selectedLegacyCertificate, setSelectedLegacyCertificate] = useState(null);
  const [isEditingLegacy, setIsEditingLegacy] = useState(false);
  const [editedLegacyData, setEditedLegacyData] = useState({});

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  // Certificate delete confirmation modal
  const [showCertificateDeleteModal, setShowCertificateDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [showLegacyDeleteModal, setShowLegacyDeleteModal] = useState(false);
  const [legacyCertificateToDelete, setLegacyCertificateToDelete] = useState(null);

  // Image viewer state
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: '',
    imageTitle: ''
  });

  // Load all candidates
  useEffect(() => {
    loadCandidates();
  }, []);

  // Filter candidates based on search term (unified search)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCandidates(candidates);
    } else {
      performUnifiedSearch(searchTerm);
    }
  }, [candidates, searchTerm]);

  // Keyboard handler for ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && imageViewer.isOpen) {
        closeImageViewer();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imageViewer.isOpen]);

  // Handle view switching
  const handleViewSwitch = (view) => {
    setCurrentView(view);
    if (view === 'candidates') {
      // Clear legacy search results when switching to candidates
      setLegacySearchResults([]);
      setLegacySearchTerm('');
      setLegacyError('');
      setSelectedLegacyCertificate(null);
      setIsEditingLegacy(false);
      setEditedLegacyData({});
    } else if (view === 'legacy') {
      // Clear candidate selection when switching to legacy
      setSelectedCandidate(null);
      setCombinedData(null);
      setIsEditing(false);
      setEditedData({});
      setActiveTab('info');
    }
  };


  // Unified search function
  const performUnifiedSearch = async (term) => {
    if (!term.trim()) {
      setFilteredCandidates(candidates);
      return;
    }

    setIsLoading(true);
    try {
      const searchPromises = [
        // Search by candidate name
        fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(term)}&field=candidate_name`),
        // Search by firstName
        fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(term)}&field=firstName`),
        // Search by lastName
        fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(term)}&field=lastName`),
        // Search by passport
        fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(term)}&field=passport`),
        // Search by CDC number
        fetch(`http://127.0.0.1:5000/candidate/search-candidates?q=${encodeURIComponent(term)}&field=cdcno`)
      ];

      const responses = await Promise.all(searchPromises);
      const results = await Promise.all(responses.map(r => r.json()));

      // Collect unique candidates
      const uniqueCandidates = new Map();

      results.forEach(result => {
        if (result.status === 'success' && result.data) {
          result.data.forEach(candidate => {
            uniqueCandidates.set(candidate.id, candidate);
          });
        }
      });

      const searchResults = Array.from(uniqueCandidates.values());

      if (searchResults.length === 1) {
        // Auto-select if only one result
        handleSelectCandidate(searchResults[0]);
      } else {
        setFilteredCandidates(searchResults);
        setSelectedCandidate(null);
        setCombinedData(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/candidate/get-all-candidates');
      const result = await response.json();

      if (result.status === 'success') {
        setCandidates(result.data);
        setFilteredCandidates(result.data);
        setError('');
      } else {
        setError('Failed to load candidates');
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setError(`Failed to load candidates: ${err.message || 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Legacy certificates search
  const performLegacySearch = async (term) => {
    if (!term.trim()) {
      setLegacySearchResults([]);
      return;
    }

    setLegacyLoading(true);
    setLegacyError('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/misc/legacy-certificates/search?q=${encodeURIComponent(term)}`);
      const result = await response.json();

      if (result.status === 'success') {
        setLegacySearchResults(result.data);
      } else {
        setLegacyError(result.message || 'Failed to search legacy certificates');
        setLegacySearchResults([]);
      }
    } catch (err) {
      console.error('Legacy search error:', err);
      setLegacyError('Failed to perform search');
      setLegacySearchResults([]);
    } finally {
      setLegacyLoading(false);
    }
  };

  const handleSelectCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setIsLoading(true);
    setError('');
    setCombinedData(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/candidate/get-combined-candidate-data/${encodeURIComponent(candidate.candidate_name)}`);
      const result = await response.json();

      if (result.status === 'success') {
        setCombinedData(result.data);
        setEditedData(result.data.candidate_info?.json_data || {});
        setActiveTab('info');
      } else {
        setError(result.message || 'Failed to load candidate data');
      }
    } catch (err) {
      console.error('Failed to load candidate data:', err);
      setError(`Failed to load candidate data: ${err.message || 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit/Save functionality
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedCandidate) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/candidate/update-candidate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCandidate.id,
          ...editedData,
          last_updated: new Date().toISOString()
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        setIsEditing(false);
        setError('');
        // Refresh combined data
        await handleSelectCandidate(selectedCandidate);
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

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Delete functionality
  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!candidateToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/candidate/delete-candidate/${candidateToDelete.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.status === 'success') {
        setShowDeleteModal(false);
        setCandidateToDelete(null);
        setSelectedCandidate(null);
        setCombinedData(null);
        await loadCandidates(); // Refresh list
      } else {
        setError(result.error || 'Failed to delete candidate');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete candidate: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificateDeleteClick = (certificate) => {
    setCertificateToDelete(certificate);
    setShowCertificateDeleteModal(true);
  };

  const confirmCertificateDelete = async () => {
    if (!certificateToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/certificate/delete-certificate-selection', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: certificateToDelete.id })
      });

      const result = await response.json();
      if (result.status === 'success') {
        setShowCertificateDeleteModal(false);
        setCertificateToDelete(null);
        // Refresh the combined data to reflect the deletion
        if (selectedCandidate) {
          await handleSelectCandidate(selectedCandidate);
        }
      } else {
        setError(result.error || 'Failed to delete certificate');
      }
    } catch (err) {
      console.error('Certificate delete error:', err);
      setError(`Failed to delete certificate: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy certificate functions
  const handleLegacySelect = async (certificate) => {
    setSelectedLegacyCertificate(certificate);
    setEditedLegacyData(certificate);
    setIsEditingLegacy(false);
  };

  const handleLegacyEdit = () => {
    setIsEditingLegacy(true);
  };

  const handleLegacySave = async () => {
    if (!selectedLegacyCertificate) return;

    setLegacyLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/misc/legacy-certificates/${selectedLegacyCertificate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedLegacyData)
      });

      const result = await response.json();
      if (result.status === 'success') {
        setIsEditingLegacy(false);
        setSelectedLegacyCertificate(editedLegacyData);
        // Refresh search results
        if (legacySearchTerm) {
          performLegacySearch(legacySearchTerm);
        }
        setLegacyError('');
      } else {
        setLegacyError(result.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Legacy save error:', err);
      setLegacyError(`Failed to save changes: ${err.message || 'Unknown error'}`);
    } finally {
      setLegacyLoading(false);
    }
  };

  const handleLegacyInputChange = (field, value) => {
    setEditedLegacyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLegacyDeleteClick = (certificate) => {
    setLegacyCertificateToDelete(certificate);
    setShowLegacyDeleteModal(true);
  };

  const confirmLegacyDelete = async () => {
    if (!legacyCertificateToDelete) return;

    setLegacyLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/misc/legacy-certificates/${legacyCertificateToDelete.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.status === 'success') {
        setShowLegacyDeleteModal(false);
        setLegacyCertificateToDelete(null);
        setSelectedLegacyCertificate(null);
        setIsEditingLegacy(false);
        setEditedLegacyData({});
        // Refresh search results
        if (legacySearchTerm) {
          performLegacySearch(legacySearchTerm);
        }
      } else {
        setLegacyError(result.error || 'Failed to delete certificate');
      }
    } catch (err) {
      console.error('Legacy delete error:', err);
      setLegacyError(`Failed to delete certificate: ${err.message || 'Unknown error'}`);
    } finally {
      setLegacyLoading(false);
    }
  };

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-6 left-6 z-50"
      >
        <motion.button
          onClick={() => navigate('/database')}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="group relative bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-900 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50"
        >
          <ArrowLeft size={20} className="relative z-10" />
        </motion.button>
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-4">
            Candidate Records
          </h1>
          <p className="text-blue-200 opacity-80 max-w-2xl mx-auto">
            Comprehensive candidate data management and tracking
          </p>
        </motion.div>

        {/* View Switch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto mb-10"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-2 border border-slate-200/50">
            <div className="flex">
              <button
                onClick={() => handleViewSwitch('candidates')}
                className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  currentView === 'candidates'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Users size={18} />
                Candidates
              </button>
              <button
                onClick={() => handleViewSwitch('legacy')}
                className={`flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  currentView === 'legacy'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <FileText size={18} />
                Legacy Certificates
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search Bar - Conditional based on view */}
        {currentView === 'candidates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Name, Passport Number, or Certificate Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-500"
              />
            </div>
          </motion.div>
        )}

        {currentView === 'legacy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-10"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search by Candidate Name, Passport, or Certificate Number..."
                value={legacySearchTerm}
                onChange={(e) => setLegacySearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performLegacySearch(legacySearchTerm)}
                className="w-full pl-14 pr-24 py-4 bg-white/90 backdrop-blur-md border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all duration-300 text-slate-800 placeholder-slate-500 text-lg shadow-lg"
              />
              <button
                onClick={() => performLegacySearch(legacySearchTerm)}
                disabled={legacyLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
              >
                {legacyLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                {legacyLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats - Conditional based on view */}
        {currentView === 'candidates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{candidates.length}</div>
                  <div className="text-sm text-gray-600">Total Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{filteredCandidates.length}</div>
                  <div className="text-sm text-gray-600">Search Results</div>
                </div>
                <div className="text-center">
                  <button
                    onClick={loadCandidates}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'legacy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mb-10"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-slate-800 mb-2">{legacySearchResults.length}</div>
                  <div className="text-sm text-slate-600 font-medium">Search Results</div>
                </div>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-4xl font-bold text-slate-800 mb-2">{selectedLegacyCertificate ? 1 : 0}</div>
                  <div className="text-sm text-slate-600 font-medium">Selected Certificate</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {(error || legacyError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {currentView === 'candidates' ? error : legacyError}
            </div>
          </motion.div>
        )}

        {currentView === 'candidates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Candidate List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-slate-200/50 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Candidates</h2>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                      <p className="text-slate-600 font-medium">Loading candidates...</p>
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        {searchTerm ? 'No candidates found' : 'No candidates available'}
                      </p>
                    </div>
                  ) : (
                    filteredCandidates.map((candidate, index) => (
                      <motion.div
                        key={candidate.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedCandidate?.id === candidate.id
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 shadow-lg shadow-indigo-500/10'
                            : 'bg-slate-50/50 hover:bg-white border-2 border-transparent hover:border-slate-200'
                        }`}
                        onClick={() => handleSelectCandidate(candidate)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            selectedCandidate?.id === candidate.id
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          } transition-colors duration-300`}>
                            <User className={`w-5 h-5 ${
                              selectedCandidate?.id === candidate.id ? 'text-white' : 'text-slate-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 truncate">{candidate.candidate_name}</div>
                            {candidate.candidate_data?.passport && (
                              <div className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Passport: {candidate.candidate_data.passport}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
            {selectedCandidate ? (
              <div className="space-y-6">
                {/* Candidate Summary */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedCandidate.candidate_name}</h2>
                      <div className="text-sm text-gray-600 mt-1">
                        {combinedData?.candidate_info?.json_data?.passport && `Passport: ${combinedData.candidate_info.json_data.passport}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                      <motion.button
                        onClick={() => handleDeleteClick(selectedCandidate)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{combinedData?.certificates?.length || 0}</div>
                      <div className="text-sm text-gray-600">Certificates</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{combinedData?.uploads?.length || 0}</div>
                      <div className="text-sm text-gray-600">Documents</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{combinedData?.data_sources?.master_table_records || 0}</div>
                      <div className="text-sm text-gray-600">Master Records</div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                  <div className="border-b border-slate-200/50 bg-slate-50/50">
                    <nav className="flex overflow-x-auto">
                      {[
                        { id: 'info', label: 'Candidate Info', icon: User },
                        { id: 'certificates', label: 'Certificates', icon: Award },
                        { id: 'documents', label: 'Documents', icon: ImageIcon },
                        { id: 'master', label: 'Master Records', icon: Briefcase }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-3 px-8 py-5 text-sm font-semibold border-b-3 transition-all duration-300 whitespace-nowrap ${
                            activeTab === tab.id
                              ? 'border-indigo-500 text-indigo-600 bg-white shadow-sm'
                              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                          }`}
                        >
                          <tab.icon size={18} />
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* Candidate Info Tab */}
                    {activeTab === 'info' && combinedData?.candidate_info && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(isEditing ? editedData : combinedData.candidate_info.json_data || {}).map(([key, value]) => (
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
                    )}

                    {/* Certificates Tab */}
                    {activeTab === 'certificates' && (
                      <div className="space-y-4">
                        {combinedData?.certificates?.length > 0 ? (
                          combinedData.certificates.map((cert, index) => {
                            console.log('Certificate data:', cert); // Debug logging
                            return (
                            <div key={cert.id || index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                                  <div><strong>ID:</strong> {cert.id}</div>
                                  <div><strong>Candidate ID:</strong> {cert.candidate_id}</div>
                                  <div><strong>Candidate:</strong> {cert.candidate_name}</div>
                                  <div><strong>Client:</strong> {cert.client_name}</div>
                                  <div><strong>Certificate:</strong> {cert.certificate_name}</div>
                                  <div><strong>Certificate No:</strong> {cert.certificate_number || 'N/A'}</div>
                                  <div><strong>Created:</strong> {new Date(cert.creation_date).toLocaleDateString()}</div>
                                  <div><strong>Start Date:</strong> {cert.start_date ? new Date(cert.start_date).toLocaleDateString() : 'N/A'}</div>
                                  <div><strong>End Date:</strong> {cert.end_date ? new Date(cert.end_date).toLocaleDateString() : 'N/A'}</div>
                                  <div><strong>Issue Date:</strong> {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'N/A'}</div>
                                  <div><strong>Expiry Date:</strong> {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'N/A'}</div>
                                  {cert.status && <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${cert.status === 'done' ? 'bg-green-100 text-green-800' : cert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{cert.status}</span></div>}
                                  {cert.serial_number && <div><strong>Serial No:</strong> {cert.serial_number}</div>}
                                  <div><strong>Verification Image:</strong> {cert.verification_image ? <span className="text-green-600">✓ Available</span> : <span className="text-red-600">✗ Not Available</span>}</div>
                                  <div><strong>Certificate Image:</strong> {cert.certificate_image ? <span className="text-green-600">✓ Available</span> : <span className="text-red-600">✗ Not Available</span>}</div>
                                </div>
                                <motion.button
                                  onClick={() => handleCertificateDeleteClick(cert)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ml-4"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </motion.button>
                              </div>
                            </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">No certificates found</div>
                        )}
                      </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {combinedData?.uploads?.length > 0 ? (
                          combinedData.uploads.map((upload, index) => (
                            <motion.div
                              key={upload.id || index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * index }}
                              className="group relative"
                            >
                              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-lg cursor-pointer group-hover:shadow-2xl transition-all duration-300 relative border border-slate-200/50">
                                <img
                                  src={`http://127.0.0.1:5000/candidate/download-image/${upload.id}`}
                                  alt={upload.file_name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                  onClick={() => openImageViewer(`http://127.0.0.1:5000/candidate/download-image/${upload.id}`, upload.file_name, `Document: ${upload.file_name}`)}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) {
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="hidden w-full h-full items-center justify-center text-slate-500 text-sm bg-gradient-to-br from-slate-100 to-slate-200">
                                  <div className="text-center">
                                    <ImageIcon size={32} className="mx-auto mb-3 opacity-60" />
                                    <p className="font-medium">Image not available</p>
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                                    <ZoomIn size={24} className="text-slate-800" />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 text-center">
                                <div className="font-semibold text-slate-800 text-sm mb-1 truncate px-2">{upload.file_name}</div>
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                  <span className="px-2 py-1 bg-slate-100 rounded-full font-medium">
                                    {upload.file_type?.toUpperCase()}
                                  </span>
                                  <span>•</span>
                                  <span>{(upload.file_size / 1024).toFixed(1)} KB</span>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-16">
                            <ImageIcon className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium text-lg">No documents found</p>
                            <p className="text-slate-400 text-sm mt-2">Uploaded documents will appear here</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Master Records Tab */}
                    {activeTab === 'master' && (
                      <div className="space-y-4">
                        {combinedData?.master_data?.length > 0 ? (
                          combinedData.master_data.map((record, index) => (
                            <div key={`${record.candidate_id}-${record.certificate_name}-${index}`} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div><strong>Creation Date:</strong> {record.creation_date ? new Date(record.creation_date).toISOString().slice(0, 19).replace('T', ' ') : 'Not Available'}</div>
                                <div><strong>Client Name:</strong> {record.client_name || 'N/A'}</div>
                                <div><strong>Candidate ID:</strong> {record.candidate_id || 'N/A'}</div>
                                <div><strong>Candidate Name:</strong> {record.candidate_name || 'N/A'}</div>
                                <div><strong>Passport:</strong> {record.passport || 'N/A'}</div>
                                <div><strong>CDC No:</strong> {record.cdcno || 'N/A'}</div>
                                <div><strong>Certificate Name:</strong> {record.certificate_name || 'N/A'}</div>
                                <div><strong>Company Name:</strong> {record.companyname || 'N/A'}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">No master records found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-white/20 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Candidate</h3>
                <p className="text-gray-500">Choose a candidate from the list to view their details</p>
              </div>
            )}
          </motion.div>
        </div>
        )}

        {currentView === 'legacy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Legacy Certificates Results */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Legacy Certificates</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {legacyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    </div>
                  ) : legacySearchResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {legacySearchTerm ? 'No certificates found' : 'Search for certificates'}
                    </div>
                  ) : (
                    legacySearchResults.map((certificate, index) => (
                      <motion.div
                        key={certificate.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedLegacyCertificate?.id === certificate.id
                            ? 'bg-blue-100 border-2 border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                        onClick={() => handleLegacySelect(certificate)}
                      >
                        <div className="font-medium text-gray-800">{certificate.candidate_name}</div>
                        <div className="text-sm text-gray-600">Certificate: {certificate.certificate_number}</div>
                        <div className="text-sm text-gray-600">Type: {certificate.certificate_name}</div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Legacy Certificate Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              {selectedLegacyCertificate ? (
                <div className="space-y-8">
                  {/* Certificate Summary */}
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-slate-200/50">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
                            <Award className="w-8 h-8 text-amber-600" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold text-slate-800">{selectedLegacyCertificate.candidate_name}</h2>
                            <div className="flex items-center gap-4 mt-2 text-slate-600">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">Certificate: {selectedLegacyCertificate.certificate_number}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Passport: {selectedLegacyCertificate.passport}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {!isEditingLegacy ? (
                          <motion.button
                            onClick={handleLegacyEdit}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <Edit size={18} />
                            Edit
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={handleLegacySave}
                            disabled={legacyLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            {legacyLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => handleLegacyDeleteClick(selectedLegacyCertificate)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <Trash2 size={18} />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(isEditingLegacy ? editedLegacyData : selectedLegacyCertificate || {}).map(([key, value]) => {
                          if (['id', 'created_at', 'updated_at'].includes(key)) return null;
                          return (
                            <div key={key} className="space-y-2">
                              <label className="block font-semibold text-gray-700 capitalize">
                                {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}:
                              </label>
                              {isEditingLegacy ? (
                                <input
                                  type={['start_date', 'end_date', 'issue_date', 'expiry_date'].includes(key) ? 'date' : 'text'}
                                  value={value || ''}
                                  onChange={(e) => handleLegacyInputChange(key, e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                />
                              ) : (
                                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                                  {['start_date', 'end_date', 'issue_date', 'expiry_date'].includes(key) && value ? new Date(value).toLocaleDateString() : (value || 'N/A')}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-white/20 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Legacy Certificate</h3>
                  <p className="text-gray-500">Choose a certificate from the list to view its details</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-200/50"
              >
                <div className="text-center mb-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    <AlertCircle size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Confirm Deletion</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Are you sure you want to delete <strong className="text-slate-800">{candidateToDelete?.candidate_name}</strong>?
                    <br />
                    <span className="text-sm text-slate-500 mt-2 block">This action cannot be undone and will remove all associated data.</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legacy Delete Confirmation Modal */}
        {showLegacyDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete certificate <strong>{legacyCertificateToDelete?.certificate_number}</strong>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLegacyDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLegacyDelete}
                  disabled={legacyLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {legacyLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Certificate Delete Confirmation Modal */}
        {showCertificateDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={() => setShowCertificateDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Certificate</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this certificate? This action cannot be undone and will also delete all related billing records, invoice images, and ledger entries.
                </p>
                {certificateToDelete && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <p className="font-semibold text-gray-800">{certificateToDelete.certificate_name}</p>
                    <p className="text-sm text-gray-600">Certificate No: {certificateToDelete.certificate_number || 'N/A'}</p>
                    <p className="text-sm text-gray-600">ID: {certificateToDelete.id}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCertificateDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCertificateDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
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
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-60 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200"
            >
              <X size={24} />
            </button>

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

            <div className="hidden w-full h-full items-center justify-center text-white text-xl bg-gray-900">
              <div className="text-center">
                <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                Image failed to load
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
              Click anywhere or press ESC to close
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CandidateRecords;