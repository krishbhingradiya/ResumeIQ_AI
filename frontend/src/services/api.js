import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: { 'Accept': 'application/json' },
});

// ── Error handler helper ──
const handleApiError = (error, context = 'Request') => {
  if (error.response) {
    const serverError = error.response.data?.error || `${context} error occurred`;
    throw new Error(serverError.length > 150 ? serverError.substring(0, 150) + '...' : serverError);
  } else if (error.code === 'ECONNABORTED') {
    throw new Error(`${context} is taking longer than expected. Please try again.`);
  } else if (error.request) {
    throw new Error('Cannot connect to server. Please check if the backend is running.');
  } else {
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

/**
 * Upload a resume PDF for AI analysis
 */
export const uploadResume = async (file, targetRole = '', onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  if (targetRole) formData.append('targetRole', targetRole);

  try {
    const response = await api.post('/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Analysis');
  }
};

/**
 * Compare 2–5 resume PDFs
 */
export const compareResumes = async (files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('resumes', file));

  try {
    const response = await api.post('/compare-resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Comparison');
  }
};

/**
 * Match resume against a job description
 */
export const matchJD = async (file, jobDescription, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobDescription', jobDescription);

  try {
    const response = await api.post('/jd-match', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'JD Match');
  }
};

/**
 * Generate resume heatmap
 */
export const getHeatmap = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  try {
    const response = await api.post('/heatmap', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Heatmap');
  }
};

/**
 * AI resume rewrite
 */
export const getRewrite = async (file, targetRole = '') => {
  const formData = new FormData();
  formData.append('resume', file);
  if (targetRole) formData.append('targetRole', targetRole);
  try {
    const response = await api.post('/rewrite', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Rewrite');
  }
};

/**
 * Generate mock interview questions
 */
export const getMockInterview = async (file, targetRole = '') => {
  const formData = new FormData();
  formData.append('resume', file);
  if (targetRole) formData.append('targetRole', targetRole);
  try {
    const response = await api.post('/mock-interview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Mock Interview');
  }
};

/**
 * Send a chat message to the AI career advisor
 */
export const sendChatMessage = async (message, analysisContext, chatHistory = []) => {
  try {
    const response = await api.post('/chat', { message, analysisContext, chatHistory });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Chat');
  }
};

/**
 * Analyze resume authenticity — detect fake content, AI generation, keyword stuffing
 */
export const getAuthenticity = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  try {
    const response = await api.post('/authenticity', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Authenticity');
  }
};

/**
 * Generate a career roadmap based on resume and target role
 */
export const getRoadmap = async (file, targetRole, onProgress) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('targetRole', targetRole);
  try {
    const response = await api.post('/roadmap', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Roadmap');
  }
};

/**
 * Shortlist candidates — upload 2-10 resumes with a target role or JD
 */
export const getShortlist = async (files, targetRole, jobDescription = '', onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('resumes', file));
  if (targetRole) formData.append('targetRole', targetRole);
  if (jobDescription) formData.append('jobDescription', jobDescription);
  try {
    const response = await api.post('/shortlist', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Shortlist');
  }
};

export default api;
