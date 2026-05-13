/**
 * Multer Upload Middleware
 * Handles PDF file upload with validation
 */

const multer = require('multer');

// Use memory storage (no files saved to disk)
const storage = multer.memoryStorage();

// File filter — only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

module.exports = upload;
