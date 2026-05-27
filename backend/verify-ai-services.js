/**
 * Verification Script — Check all AI services are properly configured
 * Usage: node verify-ai-services.js
 */

require('dotenv').config();

console.log('\n🔍 ResumeIQ AI Services Verification\n');
console.log('═'.repeat(50));

// 1. Check environment variables
console.log('\n1. Environment Variables:');
const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (!geminiKey || !geminiKey.trim()) {
  console.log('   ❌ GEMINI_API_KEY: NOT SET (REQUIRED)');
} else if (geminiKey === 'your_gemini_api_key_here') {
  console.log('   ⚠️  GEMINI_API_KEY: Using placeholder (set real key for production)');
} else {
  console.log('   ✅ GEMINI_API_KEY: Configured (starts with ' + geminiKey.substring(0, 10) + '...)');
}

if (!groqKey || !groqKey.trim()) {
  console.log('   ℹ️  GROQ_API_KEY: Not set (optional fallback)');
} else if (groqKey === 'your_groq_api_key_here') {
  console.log('   ⚠️  GROQ_API_KEY: Using placeholder (set real key to enable fallback)');
} else {
  console.log('   ✅ GROQ_API_KEY: Configured (fallback enabled)');
}

// 2. Check module imports
console.log('\n2. Module Imports:');
try {
  require('@google/generative-ai');
  console.log('   ✅ @google/generative-ai: Ready');
} catch (e) {
  console.log('   ❌ @google/generative-ai: Not installed - run npm install @google/generative-ai');
}

try {
  require('groq-sdk');
  console.log('   ✅ groq-sdk: Ready');
} catch (e) {
  console.log('   ❌ groq-sdk: Not installed - run npm install groq-sdk');
}

// 3. Check service files
console.log('\n3. Service Files:');
const services = [
  'geminiService.js',
  'advancedAIService.js',
  'chatService.js',
  'compareService.js',
  'jdMatchService.js',
  'aiEngine.js',
];

const fs = require('fs');
const path = require('path');

services.forEach(service => {
  const filePath = path.join(__dirname, 'services', service);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasValidation = content.includes('validateAPIKeyExists');
    const hasErrorHandler = content.includes('aiErrorHandler') || content.includes('logError');
    const hasEmptyCheck = content.includes("!text ||") || content.includes("!content ||");
    
    if (hasValidation && hasErrorHandler && hasEmptyCheck) {
      console.log(`   ✅ ${service}: Enhanced with error handling`);
    } else {
      const missing = [];
      if (!hasValidation) missing.push('validation');
      if (!hasErrorHandler) missing.push('error handler');
      if (!hasEmptyCheck) missing.push('empty response check');
      console.log(`   ⚠️  ${service}: Missing ${missing.join(', ')}`);
    }
  } catch (e) {
    console.log(`   ⚠️  ${service}: File not found`);
  }
});

// 4. Check error handler utility
console.log('\n4. Error Handler Utility:');
try {
  const errorHandler = require('./utils/aiErrorHandler');
  const functions = [
    'isRateLimitError',
    'isInvalidKeyError',
    'isTimeoutError',
    'isEmptyResponse',
    'validateAPIKeyExists',
    'logError',
  ];
  
  const available = functions.filter(fn => typeof errorHandler[fn] === 'function');
  console.log(`   ✅ aiErrorHandler.js: ${available.length}/${functions.length} functions available`);
  
  if (available.length < functions.length) {
    const missing = functions.filter(fn => typeof errorHandler[fn] !== 'function');
    console.log(`   ⚠️  Missing: ${missing.join(', ')}`);
  }
} catch (e) {
  console.log(`   ❌ aiErrorHandler.js: Not found or error - ${e.message}`);
}

// 5. Summary
console.log('\n' + '═'.repeat(50));
console.log('\n📝 Configuration Summary:');

const isProduction = !process.env.NODE_ENV || process.env.NODE_ENV !== 'development';
const hasGeminiKey = geminiKey && geminiKey.trim() && geminiKey !== 'your_gemini_api_key_here';
const hasGroqKey = groqKey && groqKey.trim() && groqKey !== 'your_groq_api_key_here';

if (hasGeminiKey && (isProduction ? hasGroqKey : true)) {
  console.log('✅ Ready for production deployment');
} else {
  console.log('⚠️  Not ready for production:');
  if (!hasGeminiKey) console.log('   - Set GEMINI_API_KEY in .env or environment');
  if (isProduction && !hasGroqKey) console.log('   - Optionally set GROQ_API_KEY for fallback');
}

console.log('\n');
