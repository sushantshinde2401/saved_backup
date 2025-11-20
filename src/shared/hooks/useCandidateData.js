import { useState, useEffect } from 'react';

export function useCandidateData() {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/candidate/get-current-candidate-for-certificate');

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          const trimmedData = {
            ...result.data,
            firstName: result.data.firstName?.trim() || '',
            lastName: result.data.lastName?.trim() || '',
            passport: result.data.passport?.trim() || ''
          };
          setCandidateData(trimmedData);
          setError(null);
        } else {
          setCandidateData(null);
          setError('No current candidate data available');
        }
      } else {
        const errorResult = await response.json().catch(() => ({}));
        setCandidateData(null);
        setError(errorResult.message || 'Failed to fetch candidate data');
      }
    } catch (err) {
      setCandidateData(null);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, []);

  return { candidateData, loading, error, refetch: fetchCandidateData };
}