/**
 * Advanced AI Services — Heatmap, Rewrite, Mock Interview
 * Powers the premium features of the SaaS platform.
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

const callAI = async (prompt, systemMsg = 'You are an expert resume analyst. Return ONLY valid JSON.') => {
  // Try Gemini
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text || !text.trim()) {
      throw new Error('Empty response from Gemini');
    }
    
    return text;
  } catch (geminiErr) {
    logError('Gemini/Advanced', geminiErr);
    
    if (!groq) throw geminiErr;
    
    // Groq fallback
    try {
      console.log('🤖 [Groq] Switching to backup AI...');
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 6000,
        response_format: { type: 'json_object' }
      });
      const text = completion.choices[0]?.message?.content || '';
      
      if (!text || !text.trim()) {
        throw new Error('Empty response from Groq');
      }
      
      return text;
    } catch (groqErr) {
      logError('Groq/Advanced', groqErr);
      throw new Error('Both AI services are temporarily busy. Please try again shortly.');
    }
  }
};

const parseJSON = (text) => {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  try { return JSON.parse(jsonMatch[1].trim()); }
  catch { return JSON.parse(text.trim()); }
};

// ═══════════════════════════════════════════════
// 1. RESUME HEATMAP ANALYSIS
// ═══════════════════════════════════════════════
const generateHeatmap = async (resumeText) => {
  const prompt = `Analyze this resume section by section and rate each part. Act as a hiring manager scanning this resume.

RESUME:
---
${resumeText}
---

For each section found, provide a detailed quality assessment. Rate each 0-100.

RESPOND WITH VALID JSON ONLY — NO MARKDOWN:
{
  "sections": [
    {
      "name": "<section name e.g., Contact Info, Summary, Experience, Skills, Education, Projects, Certifications>",
      "rating": "<strong|moderate|weak|missing>",
      "score": <0-100>,
      "content": "<brief 1-line summary of what's in this section>",
      "issues": ["<specific issue 1>", "<specific issue 2>"],
      "improvements": ["<specific improvement 1>"],
      "hasMetrics": <true|false>,
      "hasActionVerbs": <true|false>,
      "keywordsFound": <count of industry keywords>,
      "tooltip": "<1-2 sentence explanation for why this section scored this way>"
    }
  ],
  "overallFlow": "<1-2 sentences about the resume's overall readability flow>",
  "vagueLanguage": [
    {"text": "<exact vague phrase found>", "suggestion": "<stronger replacement>"}
  ],
  "missingMetrics": [
    {"bullet": "<bullet point missing numbers>", "improved": "<rewritten with metrics>"}
  ],
  "lowImpactBullets": [
    {"bullet": "<weak bullet>", "improved": "<stronger version>"}
  ]
}`;

  const text = await callAI(prompt);
  return parseJSON(text);
};

// ═══════════════════════════════════════════════
// 2. AI RESUME REWRITE ASSISTANT
// ═══════════════════════════════════════════════
const rewriteResume = async (resumeText, targetRole = '') => {
  const roleCtx = targetRole ? `The candidate is targeting a "${targetRole}" role. Optimize all rewrites for this role.` : '';

  const prompt = `You are a professional resume writer who has written 10,000+ resumes for top companies.
${roleCtx}

ORIGINAL RESUME:
---
${resumeText}
---

Rewrite and improve every section of this resume. Make it ATS-optimized, impactful, and professional.

RESPOND WITH VALID JSON ONLY — NO MARKDOWN:
{
  "improvedSummary": {
    "original": "<original summary or 'Missing'>",
    "improved": "<professional rewritten summary (3-4 lines)>",
    "changeReason": "<why this is better>"
  },
  "improvedBullets": [
    {
      "section": "<e.g., Experience, Projects>",
      "original": "<original bullet point>",
      "improved": "<rewritten with metrics, action verbs, impact>",
      "changeType": "<added_metrics|stronger_verbs|more_specific|restructured>",
      "changeReason": "<1 sentence why>"
    }
  ],
  "improvedSkills": {
    "original": ["<original skills>"],
    "improved": ["<optimized skills list>"],
    "added": ["<new skills to add>"],
    "removed": ["<skills to remove and why>"],
    "changeReason": "<why this is better>"
  },
  "addedSections": [
    {"name": "<section to add e.g., Professional Summary, Certifications>", "content": "<suggested content>", "reason": "<why add this>"}
  ],
  "overallImprovements": ["<high-level improvement 1>", "<high-level improvement 2>", "<high-level improvement 3>"],
  "estimatedScoreBoost": <estimated ATS score improvement in points>,
  "beforeScore": <estimated current ATS score>,
  "afterScore": <estimated new ATS score after improvements>
}

RULES:
1. Every improvement must include specific example text, not generic advice.
2. Add quantified metrics wherever possible (even estimated ones with ~).
3. Use strong action verbs (Engineered, Optimized, Spearheaded, Architected).
4. Keep bullet points concise — max 2 lines each.
5. Ensure ATS-friendly formatting suggestions.`;

  const text = await callAI(prompt);
  return parseJSON(text);
};

// ═══════════════════════════════════════════════
// 3. AI MOCK INTERVIEW GENERATOR
// ═══════════════════════════════════════════════
const generateMockInterview = async (resumeText, targetRole = '') => {
  const roleCtx = targetRole ? `for a "${targetRole}" position` : 'for a role matching their profile';

  const prompt = `Based on this resume, generate personalized mock interview questions ${roleCtx}.

RESUME:
---
${resumeText}
---

Generate interview questions in 4 categories. Each question should be specifically tied to something in the resume.

RESPOND WITH VALID JSON ONLY — NO MARKDOWN:
{
  "targetRole": "${targetRole || 'General'}",
  "difficulty": "<easy|medium|hard>",
  "categories": [
    {
      "name": "Technical Questions",
      "icon": "code",
      "questions": [
        {
          "question": "<technical question based on their skills/projects>",
          "context": "<why this question — what in their resume triggered it>",
          "expectedAnswer": "<key points a good answer should cover>",
          "difficulty": "<easy|medium|hard>",
          "tip": "<preparation tip for this question>"
        }
      ]
    },
    {
      "name": "Behavioral Questions",
      "icon": "users",
      "questions": [
        {
          "question": "<STAR-format behavioral question>",
          "context": "<relevant resume section>",
          "expectedAnswer": "<what interviewer looks for>",
          "difficulty": "<easy|medium|hard>",
          "tip": "<STAR method tip>"
        }
      ]
    },
    {
      "name": "Project Deep-Dive",
      "icon": "folder",
      "questions": [
        {
          "question": "<deep question about a specific project on their resume>",
          "context": "<which project>",
          "expectedAnswer": "<technical depth expected>",
          "difficulty": "<medium|hard>",
          "tip": "<how to prepare>"
        }
      ]
    },
    {
      "name": "HR & Culture Fit",
      "icon": "heart",
      "questions": [
        {
          "question": "<HR/culture question>",
          "context": "<why this matters>",
          "expectedAnswer": "<ideal answer framework>",
          "difficulty": "<easy|medium>",
          "tip": "<how to answer well>"
        }
      ]
    }
  ],
  "totalQuestions": <total count>,
  "preparationTips": [
    "<general interview tip 1>",
    "<general interview tip 2>",
    "<general interview tip 3>"
  ]
}

Generate 3-4 questions per category. Make them specific to THIS resume, not generic.`;

  const text = await callAI(prompt);
  return parseJSON(text);
};

module.exports = { generateHeatmap, rewriteResume, generateMockInterview };
