/**
 * AI Service — Gemini + Groq Dual-Engine
 * Primary: Google Gemini (best quality)
 * Backup:  Groq (free, ultra-fast, always available)
 *
 * If Gemini fails → instantly switches to Groq → result in seconds.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const promptTemplate = require('../utils/promptTemplate');
const {
  isRateLimitError,
  validateAPIKeyExists,
  logError,
  sleep,
  getBackoffDelay,
  getUserFriendlyMessage,
} = require('../utils/aiErrorHandler');

// Validate API key on module load
validateAPIKeyExists(process.env.GEMINI_API_KEY, 'Gemini');

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * Analyze resume using AI — tries Gemini first, then Groq as backup
 * @param {string} resumeText - Extracted resume text
 * @param {Buffer} [pdfBuffer] - Optional raw PDF buffer
 * @param {string} [targetRole] - Target job role for tailored analysis
 * @returns {Promise<Object>} Structured analysis results
 */
const analyzeResume = async (resumeText, pdfBuffer = null, targetRole = '') => {
  const prompt = promptTemplate.generatePrompt(resumeText, targetRole);

  // === TRY 1: Gemini (primary — best quality) with retry ===
  try {
    console.log('🤖 [Gemini] Analyzing resume...');
    const text = await callGeminiWithRetry(prompt);
    console.log('✅ [Gemini] Analysis complete');
    return parseAIResponse(text);
  } catch (geminiError) {
    logError('Gemini/Resume', geminiError);

    // === TRY 2: Groq backup ===
    if (groq) {
      try {
        console.log('🤖 [Groq] Switching to backup AI...');
        const text = await callGroqWithFallback(resumeText, targetRole);
        console.log('✅ [Groq] Analysis complete');
        return parseAIResponse(text);
      } catch (groqError) {
        logError('Groq/Resume', groqError);
        throw new Error(
          'Both AI services are temporarily busy. Please try again in 1 minute.'
        );
      }
    }

    // No Groq key configured — give clean error
    if (isRateLimitError(geminiError)) {
      throw new Error(
        'AI service is temporarily busy. Please wait 60 seconds and try again.'
      );
    }
    throw geminiError;
  }
};

/**
 * Call Gemini API with exponential backoff retry
 * Updated model list: gemini-2.5-flash (current) → gemini-2.0-flash (legacy)
 */
const callGeminiWithRetry = async (prompt, maxRetries = 2) => {
  // Current production models as of May 2026
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];

  for (let m = 0; m < models.length; m++) {
    const modelName = models[m];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        if (!text || !text.trim()) {
          throw new Error('Empty response from Gemini');
        }
        
        return text;
      } catch (error) {
        const isLast = attempt === maxRetries - 1;
        const errorMsg = error.message?.substring(0, 100) || 'Unknown error';
        console.warn(
          `⚠️ [Gemini/${modelName}] Attempt ${attempt + 1}/${maxRetries}: ${errorMsg}`
        );

        if (isRateLimitError(error) && !isLast) {
          const delay = getBackoffDelay(attempt);
          console.log(
            `⏳ [Gemini] Rate limited, retrying in ${(delay / 1000).toFixed(1)}s...`
          );
          await sleep(delay);
          continue;
        }

        if (isLast && m < models.length - 1) {
          console.log(`🔄 [Gemini] Trying next model: ${models[m + 1]}`);
          break; // try next model
        }

        if (isLast && m === models.length - 1) {
          throw error; // all models exhausted
        }

        if (!isRateLimitError(error)) {
          break; // non-retryable error, try next model
        }
      }
    }
  }

  throw new Error('All Gemini models exhausted');
};

/**
 * Call Groq API with compact prompt to avoid 413 errors
 * Always uses compact prompt since the full prompt is too large for free tier
 */
const callGroqWithFallback = async (resumeText, targetRole = '') => {
  const compactPrompt = generateCompactPrompt(resumeText, targetRole);

  // Model priority — try larger model first, then smaller
  const models = [
    { id: 'llama-3.1-8b-instant', maxTokens: 4096 },
    { id: 'llama-3.1-8b-instant', maxTokens: 4096 },
  ];

  let lastError;

  for (const model of models) {
    try {
      console.log(`🤖 [Groq/${model.id}] Attempting analysis...`);
      const result = await callGroqWithRetry(compactPrompt, model.id, model.maxTokens);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(
        `⚠️ [Groq/${model.id}] Failed: ${error.message?.substring(0, 120)}`
      );

      // If rate limited, wait and try next model
      if (isRateLimitError(error)) {
        await sleep(2000);
        continue;
      }
    }
  }

  throw lastError || new Error('All Groq models failed');
};

/**
 * Call Groq API with retry for rate limits
 */
const callGroqWithRetry = async (prompt, modelId, maxTokens, maxRetries = 2) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert resume analyzer and ATS specialist. Always respond with valid JSON only, no markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: modelId,
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      const isLast = attempt === maxRetries - 1;

      if (isRateLimitError(error) && !isLast) {
        // Check for retry-after header
        const retryAfter = error.headers?.['retry-after'];
        const delay = retryAfter
          ? parseInt(retryAfter) * 1000
          : Math.pow(2, attempt) * 3000 + Math.random() * 1000;
        console.log(
          `⏳ [Groq/${modelId}] Rate limited, waiting ${(delay / 1000).toFixed(1)}s...`
        );
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }
};

/**
 * Compact prompt for Groq — keeps core analysis structure
 * but much shorter than the full 11KB Gemini prompt
 */
const generateCompactPrompt = (resumeText, targetRole = '') => {
  const roleContext = targetRole
    ? `\nTARGET ROLE: ${targetRole}\nAnalyze this resume SPECIFICALLY for a "${targetRole}" position. Focus keywords, missing skills, and suggestions on what a ${targetRole} needs.\n`
    : '';

  return `Analyze this resume and return a JSON object.
${roleContext}
RESUME:
---
${resumeText}
---

Score the resume on a 0-100 ATS scale. Be brutally honest — no grade inflation.
${targetRole ? `Score keywords based on relevance to "${targetRole}" specifically.` : ''}

Scoring criteria (7 categories, must add up to atsScore, max 100):
- techKnowledge (0-20): Depth of technical expertise. 18-20 for expert with 10+ technologies used in context. 10-13 for average. 0-4 for minimal tech content.
- formatting (0-15): ATS readability, clean single-column layout, standard headings
- completeness (0-15): Has name, contact, summary, skills, experience/projects, education
- keywords (0-20): ${targetRole ? `Keywords relevant to "${targetRole}" — technologies, frameworks, tools` : 'Industry-relevant terms, specific technologies named'}
- impact (0-20): Quantified achievements with numbers/percentages/metrics. Max 5 if NO real metrics exist.
- language (0-5): Strong action verbs, concise bullet points, no passive voice
- grammar (0-5): Zero spelling errors, professional tone

Calibration guide:
- Student with decent projects: 45-60
- Fresher with internship + some metrics: 60-72
- 2-year professional with quantified work: 72-85
- Senior with leadership + rich keywords: 82-95

Return ONLY this JSON (no markdown, no backticks, no extra text):
{
  "experienceLevel": "<student|fresher|junior|mid|senior>",
  "atsScore": <integer 0-100>,
  "scoreBreakdown": {
    "techKnowledge": <0-20>,
    "formatting": <0-15>,
    "completeness": <0-15>,
    "keywords": <0-20>,
    "impact": <0-20>,
    "language": <0-5>,
    "grammar": <0-5>
  },
  "scoringContext": "<1 sentence explaining the score${targetRole ? ` in context of ${targetRole} role` : ''}>",
  "technicalSkills": ["<every technical skill found>"],
  "softSkills": ["<soft skills found or implied>"],
  "strengths": ["<3 specific strengths${targetRole ? ` relevant to ${targetRole}` : ''} with detail>"],
  "weaknesses": ["<3 honest specific weaknesses${targetRole ? ` for ${targetRole} role` : ''}>"],
  "missingSkills": ["<core missing technical skill 1>", "<core missing technical skill 2>", "<core missing technical skill 3>"],
  "suggestions": [
    "<short, simple suggestion 1 (max 3 sentences)>",
    "<short, simple suggestion 2 (max 3 sentences)>",
    "<short, simple suggestion 3 (max 3 sentences)>",
    "<short, simple suggestion 4 (max 3 sentences)>",
    "<short, simple suggestion 5 (max 3 sentences)>",
    "<short, simple suggestion 6 (max 3 sentences)>"
  ],
  "recommendedRoles": ["<roles matching their skills${targetRole ? `, including how close they are to ${targetRole}` : ''}>"]
}

RULES:
1. scoreBreakdown values MUST add up to exactly atsScore
2. Max possible score is 100 (20+15+15+20+20+5+5)
3. Score honestly — do NOT inflate
4. Every suggestion must include a concrete example rewrite
5. Write suggestions in simple, easy-to-understand language. Keep them short (maximum 3 sentences per suggestion). Provide a maximum of 6 suggestions.
${targetRole ? `6. Focus ALL feedback on what this person needs to be a great ${targetRole}. List ONLY the main core technical skills completely missing for this role.` : ''}`;
};

/**
 * Parse AI response into structured data
 */
const parseAIResponse = (responseText) => {
  // Remove markdown code blocks if present
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [
    null,
    responseText,
  ];
  let parsed;

  try {
    parsed = JSON.parse(jsonMatch[1].trim());
  } catch {
    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      console.error(
        'Failed to parse AI response:',
        responseText.substring(0, 300)
      );
      throw new Error('AI returned an invalid response. Please try again.');
    }
  }

  // Normalize — 7 criteria with correct max values
  const breakdown = parsed.scoreBreakdown || {};
  return {
    atsScore: Math.min(100, Math.max(0, parseInt(parsed.atsScore) || 0)),
    experienceLevel: parsed.experienceLevel || 'unknown',
    scoringContext: parsed.scoringContext || '',
    scoreBreakdown: {
      techKnowledge: Math.min(
        20,
        Math.max(0, parseInt(breakdown.techKnowledge) || 0)
      ),
      formatting: Math.min(
        15,
        Math.max(0, parseInt(breakdown.formatting) || 0)
      ),
      completeness: Math.min(
        15,
        Math.max(0, parseInt(breakdown.completeness) || 0)
      ),
      keywords: Math.min(20, Math.max(0, parseInt(breakdown.keywords) || 0)),
      impact: Math.min(20, Math.max(0, parseInt(breakdown.impact) || 0)),
      language: Math.min(5, Math.max(0, parseInt(breakdown.language) || 0)),
      grammar: Math.min(5, Math.max(0, parseInt(breakdown.grammar) || 0)),
    },
    technicalSkills: Array.isArray(parsed.technicalSkills)
      ? parsed.technicalSkills.map(s => typeof s === 'object' ? s.name || s.skill || s.text || JSON.stringify(s) : String(s))
      : [],
    softSkills: Array.isArray(parsed.softSkills) 
      ? parsed.softSkills.map(s => typeof s === 'object' ? s.name || s.skill || s.text || JSON.stringify(s) : String(s)) 
      : [],
    strengths: Array.isArray(parsed.strengths) 
      ? parsed.strengths.map(s => typeof s === 'object' ? s.text || s.name || s.description || JSON.stringify(s) : String(s)) 
      : [],
    weaknesses: Array.isArray(parsed.weaknesses) 
      ? parsed.weaknesses.map(s => typeof s === 'object' ? s.text || s.name || s.description || JSON.stringify(s) : String(s)) 
      : [],
    missingSkills: Array.isArray(parsed.missingSkills)
      ? parsed.missingSkills.map(s => typeof s === 'object' ? s.name || s.skill || s.text || JSON.stringify(s) : String(s))
      : [],
    suggestions: Array.isArray(parsed.suggestions) 
      ? parsed.suggestions.map(s => typeof s === 'object' ? s.text || s.suggestion || s.description || JSON.stringify(s) : String(s)) 
      : [],
    recommendedRoles: Array.isArray(parsed.recommendedRoles)
      ? parsed.recommendedRoles.map(s => typeof s === 'object' ? s.role || s.name || s.text || JSON.stringify(s) : String(s))
      : [],
  };
};

module.exports = { analyzeResume };
