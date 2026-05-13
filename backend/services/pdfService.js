/**
 * PDF Service
 * Extracts text content from PDF buffers using pdf-parse
 * With robust error handling for various PDF formats
 */

const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text content
 */
const extractText = async (buffer) => {
  try {
    // Validate the buffer is actually a PDF (starts with %PDF)
    const header = buffer.slice(0, 5).toString('ascii');
    if (!header.startsWith('%PDF')) {
      throw new Error('File does not appear to be a valid PDF (invalid header).');
    }

    // Parse with relaxed options for maximum compatibility
    const options = {
      // Don't render pages as images, just extract text
      max: 0, // no page limit
    };

    const data = await pdfParse(buffer, options);

    // Check if any text was extracted
    if (!data.text || data.text.trim().length === 0) {
      // PDF is valid but contains no extractable text (image-only PDF)
      return '[IMAGE_BASED_PDF] This resume appears to be an image-based PDF. The AI will analyze based on the file metadata available. Number of pages: ' + data.numpages;
    }

    // Clean up the extracted text
    let cleanText = data.text
      .replace(/\r\n/g, '\n')       // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')   // Remove excessive blank lines
      .replace(/\s{2,}/g, ' ')      // Remove excessive spaces
      .trim();

    console.log(`📝 Successfully extracted ${cleanText.length} characters from ${data.numpages} page(s)`);
    return cleanText;

  } catch (error) {
    console.error('PDF Parse Error Details:', error.message);

    // If pdf-parse fails, try a basic text extraction fallback
    try {
      const fallbackText = extractTextFallback(buffer);
      if (fallbackText && fallbackText.trim().length > 50) {
        console.log('📝 Fallback extraction succeeded');
        return fallbackText;
      }
    } catch (fallbackError) {
      console.error('Fallback extraction also failed:', fallbackError.message);
    }

    throw new Error(
      'Failed to parse this PDF file. This can happen with: ' +
      '(1) Image-only PDFs (like scanned documents), ' +
      '(2) Password-protected PDFs, or ' +
      '(3) Corrupted files. ' +
      'Please try uploading a text-based PDF (exported from Word, Google Docs, etc.).'
    );
  }
};

/**
 * Fallback: Extract readable ASCII text directly from PDF binary
 * This works even when pdf-parse library fails
 */
const extractTextFallback = (buffer) => {
  const text = buffer.toString('latin1');
  const extractedParts = [];

  // Look for text between BT (Begin Text) and ET (End Text) markers in PDF
  const btEtRegex = /BT[\s\S]*?ET/g;
  let match;

  while ((match = btEtRegex.exec(text)) !== null) {
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(match[0])) !== null) {
      const decoded = tjMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\')
        .replace(/\\([()])/g, '$1');
      if (decoded.trim().length > 0) {
        extractedParts.push(decoded.trim());
      }
    }

    // Also try TJ arrays
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(match[0])) !== null) {
      const parts = tjArrayMatch[1].match(/\(([^)]*)\)/g);
      if (parts) {
        const combined = parts
          .map(p => p.slice(1, -1))
          .join('')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\\\/g, '\\')
          .replace(/\\([()])/g, '$1');
        if (combined.trim().length > 0) {
          extractedParts.push(combined.trim());
        }
      }
    }
  }

  return extractedParts.join(' ');
};

module.exports = { extractText };
