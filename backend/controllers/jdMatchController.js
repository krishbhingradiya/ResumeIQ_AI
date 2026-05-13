/**
 * JD Match Controller
 * POST /jd-match — Upload resume + paste job description, get match analysis
 */

const pdfService = require('../services/pdfService');
const jdMatchService = require('../services/jdMatchService');

const matchResume = async (req, res, next) => {
  try {
    const file = req.file;
    const { jobDescription } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Please upload a resume PDF.' });
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ error: 'Please paste a job description (at least 50 characters).' });
    }

    console.log(`🎯 JD Match: ${file.originalname} vs job description (${jobDescription.length} chars)`);

    // Extract text
    let resumeText = '';
    try {
      resumeText = await pdfService.extractText(file.buffer);
    } catch {
      return res.status(400).json({ error: 'Failed to read this PDF. Try a text-based PDF.' });
    }

    // Run AI match
    const matchResult = await jdMatchService.matchResumeToJD(resumeText, jobDescription);

    console.log(`✅ JD Match complete — ${matchResult.matchPercentage}% match`);

    res.json({
      success: true,
      message: 'JD match analysis complete',
      result: matchResult,
    });
  } catch (error) {
    console.error('❌ JD Match failed:', error.message);
    next(error);
  }
};

module.exports = { matchResume };
