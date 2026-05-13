/**
 * Resume Controller
 * Orchestrates PDF parsing and Gemini AI analysis
 * Supports target role for personalized analysis
 */

const pdfService = require('../services/pdfService');
const geminiService = require('../services/geminiService');

/**
 * POST /upload-resume
 * Uploads a resume PDF, extracts text, and returns AI analysis
 * Optionally accepts a targetRole field for role-specific feedback
 */
const analyzeResume = async (req, res, next) => {
  try {
    // Validate file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded. Please upload a PDF file.' });
    }

    const targetRole = req.body.targetRole || '';

    console.log(`📄 Processing: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);
    if (targetRole) {
      console.log(`🎯 Target role: ${targetRole}`);
    }

    // Step 1: Try to extract text from PDF (for fallback)
    let resumeText = '';
    try {
      resumeText = await pdfService.extractText(req.file.buffer);
      console.log(`📝 Extracted ${resumeText.length} characters from resume`);
    } catch (parseError) {
      console.log('⚠️ Text extraction failed, will use direct PDF analysis');
      resumeText = 'Resume text could not be extracted. Please analyze the PDF directly.';
    }

    // Step 2: Analyze with AI (passes targetRole for role-specific analysis)
    const analysis = await geminiService.analyzeResume(resumeText, req.file.buffer, targetRole);

    console.log(`✅ Analysis complete — ATS Score: ${analysis.atsScore}/100`);

    // Step 3: Return results (include targetRole so dashboard knows)
    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      analysis: {
        ...analysis,
        targetRole: targetRole || null,
      },
    });

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    next(error);
  }
};

module.exports = { analyzeResume };
