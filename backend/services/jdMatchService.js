/**
 * JD Match Service — Resume vs Job Description Matching
 * Analyzes how well a resume matches a specific job description.
 * Returns match %, missing skills, optimization tips, hiring probability.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const {
  isRateLimitError,
  validateAPIKeyExists,
  logError,
  sleep,
} = require('../utils/aiErrorHandler');

// Validate API key on module load
validateAPIKeyExists(process.env.GEMINI_API_KEY, 'Gemini');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Match resume against a job description
 */
const matchResumeToJD = async (resumeText, jobDescription) => {
  const prompt = buildJDMatchPrompt(resumeText, jobDescription);
  let responseText = '';

  // Try Gemini first
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
    
    if (!responseText || !responseText.trim()) {
      throw new Error('Empty response from Gemini');
    }
  } catch (geminiError) {
    logError('Gemini/JDMatch', geminiError);
    
    if (groq) {
      try {
        console.log('🤖 [Groq] Switching to backup AI...');
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert ATS analyst and job matching specialist. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.15,
          max_tokens: 6000,
          response_format: { type: 'json_object' }
        });
        responseText = completion.choices[0]?.message?.content || '';
        
        if (!responseText || !responseText.trim()) {
          throw new Error('Empty response from Groq');
        }
      } catch (groqError) {
        logError('Groq/JDMatch', groqError);
        throw new Error('AI services are temporarily busy. Please try again shortly.');
      }
    } else {
      throw geminiError;
    }
  }

  return parseJDMatchResponse(responseText);
};

const buildJDMatchPrompt = (resumeText, jobDescription) => {
  return `You are an expert ATS specialist and hiring manager. Analyze how well this resume matches this job description with forensic precision.

══════════════════════════════════════════════════════════════
RESUME:
══════════════════════════════════════════════════════════════
${resumeText}

══════════════════════════════════════════════════════════════
JOB DESCRIPTION:
══════════════════════════════════════════════════════════════
${jobDescription}

══════════════════════════════════════════════════════════════
YOUR TASK — COMPREHENSIVE JD MATCH ANALYSIS
══════════════════════════════════════════════════════════════

1. Extract ALL required skills/qualifications from the job description
2. Check which ones the resume HAS and which are MISSING
3. Calculate a precise match percentage
4. Assess hiring probability
5. Provide specific optimization suggestions

RESPOND WITH VALID JSON ONLY — NO MARKDOWN, NO BACKTICKS:
{
  "matchPercentage": <0-100 integer — how well resume matches JD>,
  "hiringProbability": "<very_low|low|moderate|high|very_high>",
  "hiringProbabilityPercent": <0-100>,
  "overallVerdict": "<2-3 sentences summarizing the match quality>",
  "jdTitle": "<extracted job title from JD>",
  "jdCompany": "<company name if found, else 'Not specified'>",
  "jdExperienceRequired": "<e.g., '2-4 years' or 'Entry level'>",
  "candidateExperience": "<what the resume shows>",
  "matchedKeywords": [
    {"keyword": "<exact skill/requirement from JD>", "foundIn": "<where in resume it appears>", "strength": "<strong|moderate|weak>"}
  ],
  "missingKeywords": [
    {"keyword": "<required skill NOT found in resume>", "importance": "<critical|important|nice_to_have>", "suggestion": "<how to add this to resume>"}
  ],
  "missingTechnicalSkills": ["<tech skill 1>", "<tech skill 2>"],
  "missingSoftSkills": ["<soft skill 1>", "<soft skill 2>"],
  "matchBreakdown": {
    "technicalSkills": {"score": <0-100>, "matched": <count>, "total": <count>, "details": "<1 sentence>"},
    "experience": {"score": <0-100>, "details": "<1 sentence comparing required vs actual>"},
    "education": {"score": <0-100>, "details": "<1 sentence>"},
    "softSkills": {"score": <0-100>, "matched": <count>, "total": <count>, "details": "<1 sentence>"},
    "keywords": {"score": <0-100>, "matched": <count>, "total": <count>, "details": "<1 sentence>"}
  },
  "atsOptimizationTips": [
    "<specific tip 1 — e.g., 'Add Docker and Kubernetes to skills section to match DevOps requirement'>",
    "<specific tip 2>",
    "<specific tip 3>",
    "<specific tip 4>",
    "<specific tip 5>"
  ],
  "resumeImprovements": [
    {"section": "<e.g., Summary>", "current": "<what it says now or 'Missing'>", "suggested": "<improved version tailored to this JD>"},
    {"section": "<e.g., Skills>", "current": "<current skills>", "suggested": "<optimized skills list for this JD>"}
  ],
  "strengths": ["<strength 1 relevant to this JD>", "<strength 2>", "<strength 3>"],
  "dealBreakers": ["<critical gap 1 that could eliminate this candidate>", "<critical gap 2>"]
}

RULES:
1. Be extremely precise — don't guess. Only mark a skill as matched if it's explicitly in the resume.
2. Match percentage should reflect REAL overlap, not optimistic estimates.
3. A candidate missing 3+ critical requirements should have matchPercentage below 50.
4. Every suggestion must be specific and actionable with example text.`;
};

const parseJDMatchResponse = (responseText) => {
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText];
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[1].trim());
  } catch {
    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      throw new Error('AI returned an invalid response. Please try again.');
    }
  }

  return {
    matchPercentage: Math.min(100, Math.max(0, parseInt(parsed.matchPercentage) || 0)),
    hiringProbability: parsed.hiringProbability || 'moderate',
    hiringProbabilityPercent: Math.min(100, Math.max(0, parseInt(parsed.hiringProbabilityPercent) || 0)),
    overallVerdict: parsed.overallVerdict || '',
    jdTitle: parsed.jdTitle || 'Unknown Role',
    jdCompany: parsed.jdCompany || 'Not specified',
    jdExperienceRequired: parsed.jdExperienceRequired || 'Not specified',
    candidateExperience: parsed.candidateExperience || 'Not specified',
    matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    missingTechnicalSkills: Array.isArray(parsed.missingTechnicalSkills) ? parsed.missingTechnicalSkills : [],
    missingSoftSkills: Array.isArray(parsed.missingSoftSkills) ? parsed.missingSoftSkills : [],
    matchBreakdown: parsed.matchBreakdown || {},
    atsOptimizationTips: Array.isArray(parsed.atsOptimizationTips) ? parsed.atsOptimizationTips : [],
    resumeImprovements: Array.isArray(parsed.resumeImprovements) ? parsed.resumeImprovements : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    dealBreakers: Array.isArray(parsed.dealBreakers) ? parsed.dealBreakers : [],
  };
};

module.exports = { matchResumeToJD };
