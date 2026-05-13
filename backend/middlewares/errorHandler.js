/**
 * Global Error Handler Middleware
 * Catches and formats all errors consistently
 */

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size must be less than 10MB' });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  // Multer unexpected field
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Please upload a single PDF file with field name "resume"' });
  }

  // Gemini API rate limit / quota errors
  if (err.message?.includes('quota') || err.message?.includes('429') || err.message?.includes('rate') || err.message?.includes('Resource has been exhausted')) {
    return res.status(429).json({
      error: 'The AI service is temporarily busy. Please wait about 60 seconds and try again.',
    });
  }

  // Gemini API key errors
  if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
    return res.status(500).json({
      error: 'AI service is not configured properly. Please check the Gemini API key.',
    });
  }

  // Default server error — send a clean message, not raw error dumps
  const cleanMessage = err.message && err.message.length < 200
    ? err.message
    : 'Something went wrong while analyzing your resume. Please try again.';

  res.status(err.status || 500).json({
    error: cleanMessage,
  });
};

module.exports = errorHandler;
