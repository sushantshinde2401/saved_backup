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
  Loader2
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

  // Load all candidates for dropdown
  const loadCandidates = useCallback(async () => {
    setIsLoadingCandidates(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/candidate/get-all-candidates');
      const result = await response.json();

      if (result.status === 'success') {
        setCandidates(result.data);
        if (result.data.length === 0) {
          setError('No candidates found in the database');
        } else {
          setError(''); // Clear any previous error if candidates are found
        }
      } else {
        setError('Failed to load candidates');
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setError('Failed to load candidates from database');
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
      setError('Failed to save changes');
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
      setCandidateData(null);
      setImages([]);
      setError('');
      return;
    }

    setSelectedCandidateId(candidateId);
    setIsLoading(true);
    setError('');
    setCandidateData(null);
    setImages([]);

    try {
      const candidate = candidates.find(c => c.id.toString() === candidateId);
      if (candidate) {
        setCandidateData({
          id: candidate.id,
          ...candidate.candidate_data
        });
        setEditedData(candidate.candidate_data || {});
        await loadCandidateImages(candidate.candidate_name);
      } else {
        setError('Selected candidate not found');
      }
    } catch (err) {
      console.error('Failed to load candidate data:', err);
      setError('Failed to load candidate data');
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

      {/* Floating Back Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-6 left-6 z-50"
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
        {candidateData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 mb-8">
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
                  Candidate Images
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
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={`http://127.0.0.1:5000/candidate/image/${candidateData.id}/${image.image_num}`}
                          alt={image.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        {image.file_name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;