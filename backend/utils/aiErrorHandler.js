/**
 * AI Error Handler Utility
 * Provides consistent error handling, detection, and user-friendly messages
 * across all AI services (Gemini, Groq, etc.)
 */

/**
 * Detect if error is a rate limit / quota exhausted error
 */
const isRateLimitError = (error) => {
  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.statusCode || 0;
  return (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('resource has been exhausted') ||
    msg.includes('too many requests') ||
    msg.includes('quota exceeded')
  );
};

/**
 * Detect if error is an invalid API key error
 */
const isInvalidKeyError = (error) => {
  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.statusCode || 0;
  return (
    status === 401 ||
    status === 403 ||
    msg.includes('invalid api key') ||
    msg.includes('authentication failed') ||
    msg.includes('unauthorized') ||
    msg.includes('api key') ||
    msg.includes('permission denied')
  );
};

/**
 * Detect if error is a timeout error
 */
const isTimeoutError = (error) => {
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('econnaborted') ||
    msg.includes('etimedout') ||
    msg.includes('deadline exceeded') ||
    msg.includes('timed out')
  );
};

/**
 * Detect if error is an empty response
 */
const isEmptyResponse = (error) => {
  const msg = (error.message || '').toLowerCase();
  return msg.includes('empty response') || msg.includes('no content');
};

/**
 * Get user-friendly error message based on error type
 */
const getUserFriendlyMessage = (error, fallbackAvailable = false) => {
  if (isInvalidKeyError(error)) {
    return 'Configuration error: Invalid API key. Please contact support.';
  }
  
  if (isRateLimitError(error)) {
    return fallbackAvailable
      ? 'AI service is temporarily busy, switching to backup...'
      : 'AI service is temporarily busy. Please wait 60 seconds and try again.';
  }
  
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }
  
  if (isEmptyResponse(error)) {
    return 'AI service returned an empty response. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Log error with context (stripped of sensitive data)
 */
const logError = (serviceName, error, additionalContext = {}) => {
  const sanitizedMessage = (error.message || '').substring(0, 200);
  const errorType = getErrorType(error);
  
  console.error(
    `❌ [${serviceName}] ${errorType}: ${sanitizedMessage}`,
    additionalContext
  );
};

/**
 * Get error type name for logging
 */
const getErrorType = (error) => {
  if (isInvalidKeyError(error)) return 'INVALID_KEY';
  if (isRateLimitError(error)) return 'RATE_LIMIT';
  if (isTimeoutError(error)) return 'TIMEOUT';
  if (isEmptyResponse(error)) return 'EMPTY_RESPONSE';
  return 'UNKNOWN_ERROR';
};

/**
 * Validate API key configuration before making requests
 */
const validateAPIKeyExists = (apiKey, serviceName = 'AI Service') => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      `${serviceName} API key is not configured. Please set the environment variable.`
    );
  }
};

/**
 * Sleep helper for retry backoff with jitter
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attemptNumber, baseMs = 1000, maxMs = 30000) => {
  const exponential = baseMs * Math.pow(2, attemptNumber);
  const jitter = Math.random() * (baseMs / 2);
  return Math.min(exponential + jitter, maxMs);
};

module.exports = {
  isRateLimitError,
  isInvalidKeyError,
  isTimeoutError,
  isEmptyResponse,
  getUserFriendlyMessage,
  logError,
  getErrorType,
  validateAPIKeyExists,
  sleep,
  getBackoffDelay,
};
