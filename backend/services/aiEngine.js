/**
 * Robust AI Engine — Production-Grade Multi-Model Cascading Fallback
 * 
 * 5-model deep fallback chain to GUARANTEE a response:
 * 1. Groq llama-3.1-8b-instant      (fastest, separate 8B quota)
 * 2. Groq llama-3.3-70b-versatile    (best quality, separate 70B quota)
 * 3. Groq meta-llama/llama-4-scout-17b-16e-instruct (newest, separate quota)
 * 4. Gemini gemini-2.0-flash-lite    (separate lite quota from flash)
 * 5. Gemini gemini-2.0-flash         (main Gemini, may be rate-limited)
 * 
 * Each model gets retries with exponential backoff.
 * Prompt is auto-compressed for smaller models.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Compress prompt for smaller context models
 * Strips extra whitespace and shortens resume content
 */
const compressForSmallModel = (prompt) => {
  // Remove extra whitespace/newlines
  let compressed = prompt.replace(/\n{3,}/g, '\n\n').replace(/  +/g, ' ');
  
  // If still > 4000 chars, truncate the resume portion more aggressively
  if (compressed.length > 4000) {
    const resumeMatch = compressed.match(/(RESUME:[\s\S]*?)(\n\n[A-Z])/);
    if (resumeMatch) {
      const resumeSection = resumeMatch[1];
      if (resumeSection.length > 1500) {
        compressed = compressed.replace(resumeSection, resumeSection.substring(0, 1500) + '\n[TRUNCATED FOR BREVITY]');
      }
    }
  }
  
  return compressed;
};

/**
 * Try a Groq model with given parameters
 */
const tryGroq = async (model, prompt, systemMsg, label, maxTokens = 4096) => {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: prompt }
    ],
    model,
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' }
  });
  const content = completion.choices[0]?.message?.content || '';
  if (!content.trim()) throw new Error('Empty response');
  return content;
};

/**
 * Try a Gemini model
 */
const tryGemini = async (model, prompt, systemMsg) => {
  const geminiModel = genAI.getGenerativeModel({ model });
  const result = await geminiModel.generateContent(`${systemMsg}\n\n${prompt}`);
  const content = result.response.text();
  if (!content?.trim()) throw new Error('Empty response');
  return content;
};

/**
 * Call AI with multi-model cascading fallback — GUARANTEED response
 * @param {string} prompt - The prompt to send
 * @param {string} systemMsg - System message for the AI
 * @param {string} label - Label for logging
 * @returns {string} Raw AI response text
 */
const callAIWithFallback = async (prompt, systemMsg, label = 'AI') => {
  const errors = [];
  
  // Define the fallback chain — each entry is independent
  const strategies = [];

  if (groq) {
    // Strategy 1: 8B model with compressed prompt (fastest, highest RPM)
    strategies.push({
      name: `Groq/8B/${label}`,
      fn: () => tryGroq('llama-3.1-8b-instant', compressForSmallModel(prompt), systemMsg, label, 4096),
      delay: 800,
    });

    // Strategy 2: 70B model with full prompt (best quality)
    strategies.push({
      name: `Groq/70B/${label}`,
      fn: () => tryGroq('llama-3.3-70b-versatile', prompt, systemMsg, label, 6000),
      delay: 1500,
    });

    // Strategy 3: Llama 4 Scout (newest model, separate quota)
    strategies.push({
      name: `Groq/Scout/${label}`,
      fn: () => tryGroq('meta-llama/llama-4-scout-17b-16e-instruct', prompt, systemMsg, label, 6000),
      delay: 1500,
    });
  }

  // Strategy 4: Gemini Flash Lite (SEPARATE quota from Flash)
  strategies.push({
    name: `Gemini-Lite/${label}`,
    fn: () => tryGemini('gemini-2.0-flash-lite', prompt, systemMsg),
    delay: 2000,
  });

  // Strategy 5: Gemini Flash (main, may be rate-limited)
  strategies.push({
    name: `Gemini/${label}`,
    fn: () => tryGemini('gemini-2.0-flash', prompt, systemMsg),
    delay: 3000,
  });

  // Execute strategies in sequence with retries
  for (const strategy of strategies) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🤖 [${strategy.name}] Attempt ${attempt}/2...`);
        const result = await strategy.fn();
        console.log(`✅ [${strategy.name}] Complete`);
        return result;
      } catch (err) {
        const msg = err.message?.substring(0, 120) || 'Unknown';
        const isRetryable = msg.includes('429') || msg.includes('503') || msg.includes('500');
        console.error(`⚠️ [${strategy.name}] Attempt ${attempt} failed: ${msg}`);
        errors.push(`${strategy.name}: ${msg}`);
        
        // Only retry if it's a rate limit or server error (not 413 size errors)
        if (msg.includes('413') || msg.includes('too large')) break;
        if (attempt < 2 && isRetryable) await sleep(strategy.delay * attempt);
        else if (attempt < 2) await sleep(strategy.delay);
      }
    }
  }

  console.error(`❌ [${label}] All ${strategies.length} AI providers exhausted.`);
  throw new Error('All AI providers are temporarily unavailable. Please try again in a few minutes.');
};

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
const parseJSON = (text) => {
  // Strip markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const clean = jsonMatch[1].trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Try to extract JSON object from the text
    const objMatch = clean.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
};

module.exports = { callAIWithFallback, parseJSON, groq, genAI };
