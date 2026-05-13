/**
 * Compare Controller
 * POST /compare-resumes — accepts 2–5 PDF files and returns AI comparison
 */

const pdfService = require('../services/pdfService');
const compareService = require('../services/compareService');

const compareResumes = async (req, res, next) => {
  try {
    const files = req.files;

    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 resume PDFs to compare.' });
    }
    if (files.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 resumes can be compared at once.' });
    }

    console.log(`📄 Comparing ${files.length} resumes: ${files.map(f => f.originalname).join(', ')}`);

    // Extract text from each resume
    const resumeFiles = await Promise.all(
      files.map(async (file) => {
        let text = '';
        try {
          text = await pdfService.extractText(file.buffer);
        } catch {
          text = 'Text could not be extracted from this PDF. Please analyze the file directly.';
        }
        return {
          name: file.originalname.replace('.pdf', '').replace(/_/g, ' '),
          text,
          buffer: file.buffer,
        };
      })
    );

    // Run AI comparison
    const comparison = await compareService.compareResumes(resumeFiles);

    console.log(`✅ Comparison complete — Winner: Resume ${comparison.winnerIndex + 1}`);

    res.json({
      success: true,
      message: 'Comparison complete',
      comparison,
    });

  } catch (error) {
    console.error('❌ Comparison failed:', error.message);
    next(error);
  }
};

module.exports = { compareResumes };
