import { useState, useCallback } from 'react';
import { uploadResume } from '../services/api';
import { validatePDF } from '../utils/helpers';
import toast from 'react-hot-toast';

/**
 * Custom hook for handling file upload with progress tracking
 * @returns {Object} Upload state and handlers
 */
const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile) => {
    const validation = validatePDF(selectedFile);
    if (!validation.valid) {
      toast.error(validation.error);
      return false;
    }
    setFile(selectedFile);
    setError(null);
    setResults(null);
    toast.success(`"${selectedFile.name}" selected successfully`);
    return true;
  }, []);

  // Handle file upload and analysis
  const handleUpload = useCallback(async (targetRole = '') => {
    if (!file) {
      toast.error('Please select a file first');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      // Upload phase
      toast.loading('Uploading resume...', { id: 'upload' });
      
      const data = await uploadResume(file, targetRole, (percent) => {
        setProgress(percent);
        if (percent === 100) {
          setUploading(false);
          setAnalyzing(true);
          toast.loading('AI is analyzing your resume...', { id: 'upload' });
        }
      });

      setAnalyzing(false);
      setResults(data.analysis);
      toast.success('Analysis complete! 🎉', { id: 'upload' });
      return data.analysis;
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { id: 'upload' });
      return null;
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }, [file]);

  // Reset all state
  const reset = useCallback(() => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setAnalyzing(false);
    setResults(null);
    setError(null);
  }, []);

  return {
    file,
    uploading,
    progress,
    analyzing,
    results,
    error,
    handleFileSelect,
    handleUpload,
    reset,
    setResults,
  };
};

export default useFileUpload;
