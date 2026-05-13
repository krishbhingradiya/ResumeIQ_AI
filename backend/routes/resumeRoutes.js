/**
 * Resume Routes — All API endpoints
 * Handles file upload, analysis, comparison, JD matching, and advanced AI features
 */

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const resumeController = require('../controllers/resumeController');
const compareController = require('../controllers/compareController');
const jdMatchController = require('../controllers/jdMatchController');
const advancedController = require('../controllers/advancedController');

// ── Core Features ──
// POST /upload-resume — Upload and analyze a single resume PDF
router.post('/upload-resume', upload.single('resume'), resumeController.analyzeResume);

// POST /compare-resumes — Upload 2–5 PDFs and compare them
router.post('/compare-resumes', upload.array('resumes', 5), compareController.compareResumes);

// ── Premium Features ──
// POST /jd-match — Match resume against a job description
router.post('/jd-match', upload.single('resume'), jdMatchController.matchResume);

// POST /heatmap — Resume heatmap analysis
router.post('/heatmap', upload.single('resume'), advancedController.heatmapAnalysis);

// POST /rewrite — AI resume rewrite assistant
router.post('/rewrite', upload.single('resume'), advancedController.rewriteAnalysis);

// POST /mock-interview — Generate mock interview questions
router.post('/mock-interview', upload.single('resume'), advancedController.mockInterview);

// ── Enterprise Features ──
// POST /authenticity — AI fake resume & content detection
router.post('/authenticity', upload.single('resume'), advancedController.authenticityCheck);

// POST /roadmap — Smart skill gap roadmap generator
router.post('/roadmap', upload.single('resume'), advancedController.roadmapGeneration);

// POST /shortlist — Recruiter AI shortlisting assistant (2-10 resumes)
router.post('/shortlist', upload.array('resumes', 10), advancedController.shortlistAnalysis);

module.exports = router;
