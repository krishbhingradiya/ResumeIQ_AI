/**
 * Chat Service — AI Career Advisor
 * Provides personalized career guidance based on resume analysis
 * Uses Gemini (primary) + Groq (backup) dual-engine
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
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
 * Build the system prompt for the career advisor
 */
const buildSystemPrompt = (analysisContext) => {
  let systemPrompt = `You are "ResumeIQ Career Advisor" — a friendly, expert AI career coach.
You help students and professionals improve their resumes and plan their careers.

Your personality:
- Friendly and encouraging, like a supportive mentor
- Give specific, actionable advice (not generic tips)
- Use bullet points and clear formatting
- Keep responses concise but helpful (2-4 paragraphs max)
- Use emojis sparingly to keep it engaging

You can help with:
- Resume improvement suggestions (what to add, what to remove)
- Career path guidance (Data Science, AI/ML, Backend Dev, App Dev, etc.)
- Skill recommendations for specific roles
- Interview preparation tips
- Project ideas to strengthen a resume
- How to tailor a resume for specific job roles`;

  if (analysisContext) {
    if (analysisContext.resumes && Array.isArray(analysisContext.resumes)) {
      // Comparison Context
      systemPrompt += `\n\n=== RESUME COMPARISON ANALYSIS ===
Overall Verdict: ${analysisContext.overallVerdict || 'N/A'}
Winner Reason: ${analysisContext.winnerReason || 'N/A'}
Resumes Compared:
${analysisContext.resumes.map(r => 
  `- ${r.fileName} (ATS Score: ${r.atsScore}/100, Rank: ${r.rank})
   Strengths: ${r.topStrengths?.join(', ') || 'None'}
   Weaknesses: ${r.criticalWeaknesses?.join(', ') || 'None'}
   Improvements to Win: ${r.improvementsToWin?.join(', ') || 'None'}
`).join('\n')}
===

Use this comparison data to give PERSONALIZED advice. Answer questions about why a resume won, how the loser can improve, or specific differences between them.`;
    } else {
      // Single Resume Context
      systemPrompt += `\n\n=== USER'S RESUME ANALYSIS ===
ATS Score: ${analysisContext.atsScore}/100
Technical Skills: ${(analysisContext.technicalSkills || []).join(', ') || 'None detected'}
Soft Skills: ${(analysisContext.softSkills || []).join(', ') || 'None detected'}
Strengths: ${(analysisContext.strengths || []).join('; ') || 'None detected'}
Weaknesses: ${(analysisContext.weaknesses || []).join('; ') || 'None detected'}
Missing Skills: ${(analysisContext.missingSkills || []).join(', ') || 'None detected'}
Suggested Improvements: ${(analysisContext.suggestions || []).join('; ') || 'None'}
Recommended Roles: ${(analysisContext.recommendedRoles || []).join(', ') || 'None'}
===

Use this resume data to give PERSONALIZED advice. Reference their actual skills and gaps.`;
    }
  }

  return systemPrompt;
};

/**
 * Get career advice from AI
 * @param {string} message - User's question
 * @param {Object} analysisContext - Resume analysis results
 * @param {Array} chatHistory - Previous messages [{role, content}]
 * @returns {Promise<string>} AI response
 */
const getCareerAdvice = async (message, analysisContext, chatHistory = []) => {
  const systemPrompt = buildSystemPrompt(analysisContext);

  // Build conversation messages
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message },
  ];

  // Try Gemini first, then Groq
  try {
    return await callGeminiChat(messages);
  } catch (geminiError) {
    logError('Gemini/Chat', geminiError);

    if (groq) {
      try {
        return await callGroqChat(messages);
      } catch (groqError) {
        logError('Groq/Chat', groqError);
        throw new Error('AI advisor is temporarily busy. Please try again in a minute.');
      }
    }

    if (isRateLimitError(geminiError)) {
      throw new Error('AI advisor is temporarily busy. Please try again in a minute.');
    }
    throw geminiError;
  }
};

/**
 * Call Gemini for chat with retry
 */
const callGeminiChat = async (messages) => {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  const maxRetriesPerModel = 2;
  const baseDelayMs = 2000;

  for (let m = 0; m < models.length; m++) {
    const modelName = models[m];
    const model = genAI.getGenerativeModel({ model: modelName });

    // Convert messages to Gemini format
    const systemInstruction = messages[0].content;
    const chatMessages = messages.slice(1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const chat = model.startChat({
          systemInstruction,
          history: chatMessages.slice(0, -1),
        });

        const result = await chat.sendMessage(chatMessages[chatMessages.length - 1].parts[0].text);
        const text = result.response.text();
        
        if (!text || !text.trim()) {
          throw new Error('Empty response from Gemini');
        }
        
        return text;
      } catch (error) {
        const isLast = attempt === maxRetriesPerModel;
        console.warn(`[Gemini Chat ${modelName}] Attempt ${attempt} failed: ${error.message?.substring(0, 100) || 'Unknown error'}`);

        if (isRateLimitError(error) && !isLast) {
          const delay = getBackoffDelay(attempt - 1);
          console.log(`⏳ [Gemini Chat] Retrying in ${(delay / 1000).toFixed(1)}s...`);
          await sleep(delay);
          continue;
        }

        if (isLast && m < models.length - 1) {
          console.log(`🔄 [Gemini Chat] Trying next model...`);
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
  
  throw new Error('All Gemini chat models exhausted');
};

/**
 * Call Groq for chat (backup) with retry
 */
const callGroqChat = async (messages) => {
  const models = [
    { id: 'llama-3.1-8b-instant', maxTokens: 2000 },
    { id: 'llama-3.1-8b-instant', maxTokens: 2000 },
  ];

  let lastError;

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'system' : m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        model: model.id,
        temperature: 0.5,
        max_tokens: model.maxTokens,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.';
    } catch (error) {
      lastError = error;
      console.warn(`[Groq Chat ${model.id}] failed:`, error.message.substring(0, 100));

      if (isRateLimitError(error)) {
        // Parse retry-after from groq error if available, default to 3s
        let retryAfterMs = 3000;
        const retryMatch = error.message.match(/try again in ([\d.]+)s/);
        if (retryMatch && retryMatch[1]) {
          retryAfterMs = parseFloat(retryMatch[1]) * 1000 + 500;
        }

        console.log(`⏳ [Groq Chat] Waiting ${(retryAfterMs / 1000).toFixed(1)}s for rate limit...`);
        await sleep(retryAfterMs);
      }
      
      console.log(`🔄 [Groq Chat] Falling back to next model...`);
    }
  }

  throw lastError;
};

module.exports = { getCareerAdvice };
