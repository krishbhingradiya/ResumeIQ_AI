/**
 * Advanced AI Controller
 * POST /heatmap — Resume heatmap analysis
 * POST /rewrite — AI resume rewrite assistant
 * POST /mock-interview — Generate mock interview questions
 * POST /authenticity — AI fake resume & content detection
 * POST /roadmap — Smart skill gap roadmap generator
 * POST /shortlist — Recruiter AI shortlisting assistant
 */

const pdfService = require('../services/pdfService');
const { generateHeatmap, rewriteResume, generateMockInterview } = require('../services/advancedAIService');
const { analyzeAuthenticity } = require('../services/authenticityService');
const { generateRoadmap } = require('../services/roadmapService');
const { shortlistCandidates } = require('../services/shortlistService');

// Resume Heatmap
const heatmapAnalysis = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Please upload a resume PDF.' });

    const resumeText = await pdfService.extractText(file.buffer);
    console.log('🔥 Generating resume heatmap...');
    const heatmap = await generateHeatmap(resumeText);
    console.log('✅ Heatmap complete');

    res.json({ success: true, message: 'Heatmap generated', result: heatmap });
  } catch (error) {
    console.error('❌ Heatmap failed:', error.message);
    next(error);
  }
};

// Resume Rewrite
const rewriteAnalysis = async (req, res, next) => {
  try {
    const file = req.file;
    const { targetRole } = req.body;
    if (!file) return res.status(400).json({ error: 'Please upload a resume PDF.' });

    const resumeText = await pdfService.extractText(file.buffer);
    console.log('✍️ AI rewriting resume...');
    const rewrite = await rewriteResume(resumeText, targetRole || '');
    console.log('✅ Rewrite complete');

    res.json({ success: true, message: 'Resume rewrite complete', result: rewrite });
  } catch (error) {
    console.error('❌ Rewrite failed:', error.message);
    next(error);
  }
};

// Mock Interview
const mockInterview = async (req, res, next) => {
  try {
    const file = req.file;
    const { targetRole } = req.body;
    if (!file) return res.status(400).json({ error: 'Please upload a resume PDF.' });

    const resumeText = await pdfService.extractText(file.buffer);
    console.log('🎤 Generating mock interview...');
    const interview = await generateMockInterview(resumeText, targetRole || '');
    console.log('✅ Mock interview ready');

    res.json({ success: true, message: 'Mock interview generated', result: interview });
  } catch (error) {
    console.error('❌ Mock interview failed:', error.message);
    next(error);
  }
};

// ═══════════════════════════════════════════════
// NEW: Resume Authenticity & AI Detection
// ═══════════════════════════════════════════════
const authenticityCheck = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Please upload a resume PDF.' });

    const resumeText = await pdfService.extractText(file.buffer);
    console.log(`📝 Extracted ${resumeText.length} characters from uploaded file`);
    console.log('🔍 Analyzing resume authenticity...');
    const result = await analyzeAuthenticity(resumeText);
    console.log('✅ Authenticity analysis complete');

    res.json({ success: true, message: 'Authenticity analysis complete', result });
  } catch (error) {
    console.error('❌ Authenticity check failed:', error.message);
    // Return validation errors (non-resume, too large) as 400 directly
    if (error.message.includes('not') || error.message.includes('resume') || 
        error.message.includes('academic') || error.message.includes('too large') ||
        error.message.includes('markers') || error.message.includes('upload a valid')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// ═══════════════════════════════════════════════
// NEW: Smart Skill Gap Roadmap Generator
// ═══════════════════════════════════════════════
const roadmapGeneration = async (req, res, next) => {
  try {
    const file = req.file;
    const { targetRole } = req.body;
    if (!file) return res.status(400).json({ error: 'Please upload a resume PDF.' });
    if (!targetRole) return res.status(400).json({ error: 'Please specify a target role.' });

    const resumeText = await pdfService.extractText(file.buffer);
    console.log(`🗺️ Generating career roadmap for "${targetRole}"...`);
    const result = await generateRoadmap(resumeText, targetRole);
    console.log('✅ Roadmap generated');

    res.json({ success: true, message: 'Career roadmap generated', result });
  } catch (error) {
    console.error('❌ Roadmap generation failed:', error.message);
    next(error);
  }
};

// ═══════════════════════════════════════════════
// NEW: Recruiter AI Shortlisting Assistant
// ═══════════════════════════════════════════════
const shortlistAnalysis = async (req, res, next) => {
  try {
    const files = req.files;
    const { targetRole, jobDescription } = req.body;
    if (!files || files.length < 2) return res.status(400).json({ error: 'Please upload at least 2 resumes.' });
    if (files.length > 10) return res.status(400).json({ error: 'Maximum 10 resumes allowed.' });
    if (!targetRole && !jobDescription) return res.status(400).json({ error: 'Please specify a target role or job description.' });

    console.log(`🏆 Shortlisting ${files.length} candidates...`);
    const candidateTexts = await Promise.all(
      files.map(f => pdfService.extractText(f.buffer))
    );

    const result = await shortlistCandidates(candidateTexts, targetRole || '', jobDescription || '');
    console.log('✅ Shortlisting complete');

    res.json({ success: true, message: 'Candidates shortlisted', result });
  } catch (error) {
    console.error('❌ Shortlisting failed:', error.message);
    next(error);
  }
};

module.exports = { heatmapAnalysis, rewriteAnalysis, mockInterview, authenticityCheck, roadmapGeneration, shortlistAnalysis };
