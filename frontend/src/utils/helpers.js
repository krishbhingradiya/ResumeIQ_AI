/**
 * Get color class based on ATS score value
 * @param {number} score - ATS score (0-100)
 * @returns {string} Tailwind color class
 */
export const getScoreColor = (score) => {
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-400', stroke: '#34d399' };
  if (score >= 60) return { text: 'text-blue-400', bg: 'bg-blue-400', stroke: '#60a5fa' };
  if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-400', stroke: '#fbbf24' };
  return { text: 'text-red-400', bg: 'bg-red-400', stroke: '#f87171' };
};

/**
 * Get score label text
 * @param {number} score - ATS score (0-100)
 * @returns {string} Label text
 */
export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Needs Improvement';
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate if file is a PDF
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validatePDF = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Please upload a PDF file' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true, error: null };
};

/**
 * Smooth scroll to element
 * @param {string} elementId - Target element ID
 */
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
