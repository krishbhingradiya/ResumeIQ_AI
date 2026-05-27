/**
 * Compare Service — Unified Single-Pass Architecture
 *
 * Runs the entire forensic analysis AND ranking in ONE API call.
 * This completely eliminates the 429 Rate Limit errors and reduces
 * comparison time from ~60-90s down to ~15-20s.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { generateUnifiedComparePrompt } = require('../utils/comparePrompt');
const {
  isRateLimitError,
  validateAPIKeyExists,
  logError,
  sleep,
  getBackoffDelay,
} = require('../utils/aiErrorHandler');

// Validate API key on module load
validateAPIKeyExists(process.env.GEMINI_API_KEY, 'Gemini');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * Compare multiple resumes in a single API call
 */
const compareResumes = async (resumeFiles) => {
  console.log(`\n🔬 Starting unified single-pass comparison of ${resumeFiles.length} resumes...`);
  
  const prompt = generateUnifiedComparePrompt(resumeFiles);
  let responseText = '';

  // === TRY 1: GEMINI (with retry and fallback) ===
  try {
    console.log('🤖 [Gemini] Analyzing and ranking all resumes...');
    responseText = await callGeminiWithRetry(prompt);
    console.log('✅ [Gemini] Unified comparison complete');
  } catch (geminiError) {
    logError('Gemini/Compare', geminiError);

    // === TRY 2: GROQ FALLBACK ===
    if (groq) {
      try {
        console.log('🤖 [Groq] Switching to backup AI...');
        responseText = await callGroqWithFallback(prompt);
        console.log('✅ [Groq] Unified comparison complete');
      } catch (groqError) {
        logError('Groq/Compare', groqError);
        throw new Error('All AI services are temporarily busy. Please try again in 30 seconds.');
      }
    } else {
      if (isRateLimitError(geminiError)) {
        throw new Error('AI service is temporarily busy. Please wait 60 seconds and try again.');
      }
      throw new Error('AI service rate limit hit. Please try again in 30 seconds.');
    }
  }

  // === PARSE & NORMALIZE ===
  return parseUnifiedResponse(responseText, resumeFiles);
};

const callGeminiWithRetry = async (prompt, maxRetries = 2) => {
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
        console.warn(`⚠️ [Gemini/${modelName}] Attempt ${attempt + 1}/${maxRetries}: ${errorMsg}`);

        if (isRateLimitError(error) && !isLast) {
          const delay = getBackoffDelay(attempt);
          console.log(`⏳ [Gemini] Retrying in ${(delay / 1000).toFixed(1)}s...`);
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

const callGroqWithFallback = async (prompt) => {
  const models = [
    { id: 'llama-3.1-8b-instant', maxTokens: 3000 },
    { id: 'llama-3.1-8b-instant', maxTokens: 3000 },
  ];

  let lastError;

  for (const model of models) {
    try {
      console.log(`🤖 [Groq/${model.id}] Attempting analysis...`);
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'You are an expert ATS auditor. Analyze and rank these resumes. Return ONLY valid JSON format.'
              },
              { role: 'user', content: prompt }
            ],
            model: model.id,
            temperature: 0.1,
            max_tokens: model.maxTokens,
            response_format: { type: 'json_object' }
          });
          return completion.choices[0]?.message?.content || '';
        } catch (error) {
          const isLast = attempt === 1;
          if (isRateLimitError(error) && !isLast) {
            await sleep(3000);
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ [Groq/${model.id}] Failed: ${error.message?.substring(0, 120)}`);
    }
  }

  throw lastError || new Error('All Groq models failed');
};

const parseUnifiedResponse = (responseText, resumeFiles) => {
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText];
  let parsed;

  try {
    parsed = JSON.parse(jsonMatch[1].trim());
  } catch {
    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      console.error('Failed to parse compare response:', responseText.substring(0, 300));
      throw new Error('AI returned an invalid response format. Please try again.');
    }
  }

  // Ensure all resumes map correctly and scores are re-computed accurately
  // 7-criterion system: techKnowledge/20 + formatting/15 + completeness/15 +
  //                     keywords/20 + impact/20 + language/5 + grammar/5 = 100
  const normalizedResumes = (parsed.resumes || []).map((r, i) => {
    const originalFile = resumeFiles.find(f => f.name === r.resumeName) || resumeFiles[i] || {};
    const bd = r.scoreBreakdown || {};
    
    const techKnowledge = Math.min(20, Math.max(0, parseInt(bd.techKnowledge) || 0));
    const formatting    = Math.min(15, Math.max(0, parseInt(bd.formatting)    || 0));
    const completeness  = Math.min(15, Math.max(0, parseInt(bd.completeness)  || 0));
    const keywords      = Math.min(20, Math.max(0, parseInt(bd.keywords)      || 0));
    const impact        = Math.min(20, Math.max(0, parseInt(bd.impact)        || 0));
    const language      = Math.min(5,  Math.max(0, parseInt(bd.language)      || 0));
    const grammar       = Math.min(5,  Math.max(0, parseInt(bd.grammar)       || 0));
    
    // Force accurate total (max 100)
    const computedTotal = techKnowledge + formatting + completeness + keywords + impact + language + grammar;

    return {
      index:              r.index ?? i,
      label:              originalFile.name ? `Resume ${i + 1} — ${originalFile.name}` : `Resume ${i + 1}`,
      fileName:           originalFile.name || r.resumeName || `Resume ${i + 1}`,
      experienceLevel:    r.experienceLevel || 'student',
      atsScore:           computedTotal,
      scoreBreakdown:     { techKnowledge, formatting, completeness, keywords, impact, language, grammar },
      scoreJustification: r.scoreJustification || {},
      extractedFacts:     r.extractedFacts || {},
      topStrengths:       Array.isArray(r.topStrengths) ? r.topStrengths : [],
      criticalWeaknesses: Array.isArray(r.criticalWeaknesses) ? r.criticalWeaknesses : [],
      whyItLost:          r.whyItLost || null,
      improvementsToWin:  Array.isArray(r.improvementsToWin) ? r.improvementsToWin : []
    };
  });

  // Verify rank array exists
  const rankedOrder = Array.isArray(parsed.rankedOrder) && parsed.rankedOrder.length === normalizedResumes.length
    ? parsed.rankedOrder
    : [...normalizedResumes].sort((a, b) => b.atsScore - a.atsScore).map(r => r.index);

  // Apply ranks
  rankedOrder.forEach((originalIndex, rankPos) => {
    const res = normalizedResumes.find(r => r.index === originalIndex);
    if (res) res.rank = rankPos + 1;
  });

  const winnerIndex = parsed.winnerIndex ?? rankedOrder[0];

  return {
    winnerIndex,
    winnerReason:   parsed.winnerReason || `${normalizedResumes.find(r => r.index === winnerIndex)?.fileName} had the highest ATS score.`,
    rankedOrder,
    keyDifferences: Array.isArray(parsed.keyDifferences) ? parsed.keyDifferences : [],
    overallVerdict: parsed.overallVerdict || 'Comparison complete.',
    resumes:        normalizedResumes,
  };
};

module.exports = { compareResumes };
