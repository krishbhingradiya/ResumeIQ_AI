/**
 * ResumeIQ AI — Backend Server
 * Express.js server with Gemini AI integration for resume analysis
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const resumeRoutes = require('./routes/resumeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middlewares/errorHandler');

// ===== Configuration Validation =====
const validateConfiguration = () => {
  const errors = [];
  
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
    errors.push('❌ GEMINI_API_KEY is not configured. Set it in your .env file or environment.');
  }
  
  if (errors.length > 0) {
    console.error('\n⚠️  Configuration Errors:');
    errors.forEach(err => console.error(err));
    console.error('\nPlease fix the above errors and restart the server.\n');
    process.exit(1);
  }
  
  console.log('\n✅ Configuration validated:');
  console.log(`   • Gemini API: Configured`);
  if (process.env.GROQ_API_KEY) {
    console.log(`   • Groq API: Configured (fallback enabled)`);
  } else {
    console.log(`   • Groq API: Not configured (optional fallback)`);
  }
};

validateConfiguration();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '5mb' }));

// ===== Routes =====

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ResumeIQ AI Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    groqConfigured: !!process.env.GROQ_API_KEY,
  });
});

// Resume analysis routes
app.use('/', resumeRoutes);
app.use('/', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`\n🚀 ResumeIQ AI Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});
