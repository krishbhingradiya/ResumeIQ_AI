import axios from 'axios';
import { getSupabaseErrorMessage, isNetworkError } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: { 'Accept': 'application/json' },
});

// ━━━ PRODUCTION-GRADE ERROR HANDLER ━━━
const handleApiError = (error, context = 'Request') => {
  // Network errors
  if (!error.response && error.code === 'ECONNABORTED') {
    const userMessage = `${context} timed out after 3 minutes. Your connection may be slow. Please try again.`;
    console.error(`⏱️ Timeout [${context}]:`, error.message);
    throw new Error(userMessage);
  }

  // Network connection failures
  if (!error.response) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      const userMessage = 'Cannot connect to server. Please check if the backend is running.';
      console.error(`🔌 Connection Refused [${context}]:`, error.message);
      throw new Error(userMessage);
    }

    if (error.message?.includes('Network') || error.message?.includes('offline')) {
      const userMessage = 'You appear to be offline. Please check your internet connection.';
      console.error(`📡 Network Error [${context}]:`, error.message);
      throw new Error(userMessage);
    }

    // Generic network error
    const userMessage = 'Unable to reach the server. Please check your internet and try again.';
    console.error(`❌ Network Error [${context}]:`, error.message);
    throw new Error(userMessage);
  }

  // Server response errors
  if (error.response) {
    const status = error.response.status;
    const serverError = error.response.data?.error || error.response.data?.message || `${context} failed`;

    // Authentication errors (401)
    if (status === 401) {
      const userMessage = 'Your session has expired. Please refresh and try again.';
      console.error(`🔐 Auth Error [${context}] (401):`, serverError);
      throw new Error(userMessage);
    }

    // Forbidden (403)
    if (status === 403) {
      const userMessage = 'You do not have permission to perform this action.';
      console.error(`🚫 Forbidden [${context}] (403):`, serverError);
      throw new Error(userMessage);
    }

    // Not found (404)
    if (status === 404) {
      const userMessage = 'The requested resource was not found. Please try again.';
      console.error(`📍 Not Found [${context}] (404):`, serverError);
      throw new Error(userMessage);
    }

    // Bad request (400)
    if (status === 400) {
      const userMessage = serverError.length > 150 ? serverError.substring(0, 150) + '...' : serverError;
      console.error(`⚠️ Bad Request [${context}] (400):`, serverError);
      throw new Error(userMessage);
    }

    // Rate limiting (429)
    if (status === 429) {
      const userMessage = 'Too many requests. Please wait a moment and try again.';
      console.error(`⏳ Rate Limited [${context}] (429):`, serverError);
      throw new Error(userMessage);
    }

    // Server errors (5xx)
    if (status >= 500) {
      const userMessage = `Server error (${status}). Please try again later or contact support.`;
      console.error(`💥 Server Error [${context}] (${status}):`, serverError);
      throw new Error(userMessage);
    }

    // Generic server error
    const userMessage = serverError.length > 150 ? serverError.substring(0, 150) + '...' : serverError;
    console.error(`❌ Error [${context}] (${status}):`, serverError);
    throw new Error(userMessage);
  }

  // Unknown error
  const userMessage = 'An unexpected error occurred. Please try again.';
  console.error(`⚠️ Unknown Error [${context}]:`, error.message);
  throw new Error(userMessage);
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
