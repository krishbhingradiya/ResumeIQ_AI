/**
 * Resume Authenticity & AI Detection Service
 * 
 * Uses a STRUCTURAL resume validator (not just keywords) to guarantee
 * that only actual resumes/CVs get analyzed. College PDFs, textbooks,
 * presentations, and other documents are instantly rejected.
 */

const { callAIWithFallback, parseJSON } = require('./aiEngine');

// ═══════════════════════════════════════════════════════════════
// STRUCTURAL Resume Detector — Checks for things ONLY resumes have
// ═══════════════════════════════════════════════════════════════

function detectIfResume(text) {
  const lower = text.toLowerCase();
  const charCount = text.length;
  const failures = [];
  let score = 0;
  const maxScore = 100;

  // ━━━ HARD FAIL #1: Page length ━━━
  // A resume is NEVER more than 5 pages (~5000 chars). Most are 1-3 pages.
  // A 40-page document (14,000+ chars) is absolutely NOT a resume.
  if (charCount > 8000) {
    failures.push(`Document is too long (${charCount} characters, ~${Math.round(charCount / 350)} pages). Resumes are typically 1-3 pages.`);
    // Still continue checking but this is a very strong signal
    score -= 40;
  } else if (charCount < 150) {
    failures.push('Document is too short to be a resume.');
    score -= 50;
  } else {
    score += 15; // Good length for a resume
  }

  // ━━━ HARD FAIL #2: Must have personal contact info ━━━
  // Every resume MUST have at least an email or phone number.
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,4}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{2,5}/.test(text);
  const hasLinkedIn = /linkedin\.com\/in\//i.test(text);

  if (hasEmail) score += 20;
  if (hasPhone) score += 15;
  if (hasLinkedIn) score += 10;

  if (!hasEmail && !hasPhone) {
    failures.push('No personal contact information found (email or phone number). Every resume must have contact details.');
    score -= 25;
  }

  // ━━━ STRUCTURAL CHECK #3: Resume section headers ━━━
  // Real resumes have specific section headings. We check for patterns that 
  // appear as standalone section headers (not just mentioned in text).
  const sectionPatterns = [
    /\b(work\s*experience|professional\s*experience|employment\s*history)\b/i,
    /\b(education|academic\s*qualifications|educational\s*background)\b/i,
    /\b(skills|technical\s*skills|core\s*competencies|key\s*skills)\b/i,
    /\b(projects|personal\s*projects|academic\s*projects)\b/i,
    /\b(certifications?|licenses?)\b/i,
    /\b(objective|career\s*objective|professional\s*summary)\b/i,
    /\b(achievements|awards|honors)\b/i,
    /\b(internship|training)\b/i,
    /\b(declaration|i hereby declare)\b/i,
    /\b(hobbies|interests|extracurricular)\b/i,
    /\b(references\s*available|references\s*upon\s*request)\b/i,
  ];

  let sectionCount = 0;
  for (const pattern of sectionPatterns) {
    if (pattern.test(text)) sectionCount++;
  }

  if (sectionCount >= 4) score += 25;
  else if (sectionCount >= 2) score += 10;
  else {
    failures.push(`Only ${sectionCount} resume section headers found. Resumes typically have 4+ sections (Experience, Education, Skills, etc.).`);
    score -= 15;
  }

  // ━━━ STRUCTURAL CHECK #4: Work history date ranges ━━━
  // Resumes have date ranges like "2020-2023", "Jan 2021 - Present", "2019 - till date"
  const dateRangePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)?\s*\d{4}\s*[-–—to]+\s*(present|current|till\s*date|ongoing|\d{4})\b/gi;
  const dateRanges = (text.match(dateRangePattern) || []).length;

  if (dateRanges >= 2) score += 20;
  else if (dateRanges === 1) score += 5;
  else {
    failures.push('No work/education date ranges found (e.g., "2020 - 2023"). Resumes must show career/education timeline.');
    score -= 10;
  }

  // ━━━ STRUCTURAL CHECK #5: Person name at top ━━━
  // Resumes usually start with a person's name (capitalized words in first 200 chars)
  const firstBlock = text.substring(0, 300);
  const namePattern = /^[\s]*[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+){0,3}\s*$/m;
  const hasNameAtTop = namePattern.test(firstBlock);
  if (hasNameAtTop) score += 10;

  // ━━━ NEGATIVE SIGNALS: Academic/textbook patterns ━━━
  const academicPatterns = [
    /\bchapter\s+\d/i,
    /\bunit[\s-]+\d/i,
    /\bslide\s+\d/i,
    /\blecture\s+\d/i,
    /\bfigure\s+\d/i,
    /\bfig\.\s*\d/i,
    /\btheorem\s+\d/i,
    /\bexample\s*\d*\s*:/i,
    /\bsolution\s*:/i,
    /\bproblem\s*\d*\s*:/i,
    /\btable\s+of\s+contents/i,
    /\bbibliography/i,
    /\bsyllabus/i,
    /\bcourse\s+outline/i,
    /\blearning\s+objectives/i,
    /\bsemester\s+\d/i,
    /\bcredit\s+hours/i,
    /\bisbn/i,
    /\bedition\b/i,
    /\bhomework/i,
    /\bassignment\s*\d/i,
    /\bmidterm/i,
    /\bfinal\s+exam/i,
    /\bpublished\s+by/i,
    /\bpage\s+\d+\s+of\s+\d+/i,
    /\bquiz\b/i,
    /\bpseudocode/i,
    /\bproof\s*:/i,
  ];

  let academicHits = 0;
  for (const pattern of academicPatterns) {
    if (pattern.test(text)) academicHits++;
  }

  if (academicHits >= 3) {
    score -= 30;
    failures.push(`Found ${academicHits} academic/textbook patterns (chapters, figures, assignments, etc.).`);
  } else if (academicHits >= 1) {
    score -= 10;
  }

  // ━━━ FINAL DECISION ━━━
  const confidence = Math.max(0, Math.min(100, score + 50)); // Normalize to 0-100

  console.log(`📊 Resume Detection: score=${score}, sections=${sectionCount}, dateRanges=${dateRanges}, email=${hasEmail}, phone=${hasPhone}, academic=${academicHits}, chars=${charCount}, confidence=${confidence}%`);

  if (score < 0 || confidence < 35) {
    return {
      isResume: false,
      confidence,
      reason: `This does not appear to be a resume. ${failures.join(' ')}`,
    };
  }

  // Extra safety: if document is very long AND has few resume structures, reject
  if (charCount > 6000 && sectionCount < 3 && dateRanges < 2) {
    return {
      isResume: false,
      confidence: Math.min(confidence, 25),
      reason: `This ${Math.round(charCount / 350)}-page document lacks core resume structure (sections: ${sectionCount}, date ranges: ${dateRanges}). It appears to be a study document or textbook, not a resume.`,
    };
  }

  return {
    isResume: true,
    confidence,
    reason: `Document identified as resume (${confidence}% confidence).`,
  };
}

// ═══════════════════════════════════════════════════════════════
// AI-Powered Deep Authenticity Analysis
// ═══════════════════════════════════════════════════════════════

const analyzeAuthenticity = async (resumeText) => {
  // --- GATE: Structural resume detection (instant, no AI) ---
  const detection = detectIfResume(resumeText);
  if (!detection.isResume) {
    throw new Error(detection.reason);
  }
  console.log(`✅ Document passed resume check (${detection.confidence}% confidence)`);

  // --- AI Authenticity Analysis ---
  const truncated = resumeText.length > 3000 ? resumeText.substring(0, 3000) + '\n[TRUNCATED]' : resumeText;

  const prompt = `Analyze this resume for authenticity. Check for: AI-generated content, fake experience, keyword stuffing, inconsistent career progression, unrealistic metrics, skill mismatches.

RESUME:
${truncated}

Return VALID JSON ONLY with this structure:
{"authenticityScore":0-100,"aiGeneratedProbability":0-100,"riskLevel":"low|medium|high|critical","trustworthinessGrade":"A+|A|B+|B|C+|C|D|F","overallVerdict":"1 sentence summary","categories":{"experienceConsistency":{"score":0-100,"status":"pass|warning|fail","findings":["finding"]},"skillAuthenticity":{"score":0-100,"status":"pass|warning|fail","findings":["finding"]},"contentOriginality":{"score":0-100,"status":"pass|warning|fail","findings":["finding"]},"metricRealism":{"score":0-100,"status":"pass|warning|fail","findings":["finding"]},"careerProgression":{"score":0-100,"status":"pass|warning|fail","findings":["finding"]},"keywordNaturalness":{"score":0-100,"status":"pass|warning|fail","findings":["finding"]}},"redFlags":[{"severity":"critical|high|medium|low","type":"fake_experience|ai_generated|keyword_stuffing","title":"flag title","description":"explanation","evidence":"quote from resume","recommendation":"what to verify"}],"aiPatterns":[{"pattern":"pattern name","example":"phrase from resume","confidence":0-100}],"genuineIndicators":["positive signal"],"recruiterAdvice":["advice"]}

Be fair. Score 70+ = authentic. Below 50 = concerns. Provide evidence, not assumptions.`;

  const text = await callAIWithFallback(prompt, 'You are an expert resume fraud detection analyst. Return ONLY valid JSON.', 'Authenticity');
  const parsed = parseJSON(text);

  return {
    authenticityScore: Math.min(100, Math.max(0, parseInt(parsed.authenticityScore) || 50)),
    aiGeneratedProbability: Math.min(100, Math.max(0, parseInt(parsed.aiGeneratedProbability) || 0)),
    riskLevel: ['low', 'medium', 'high', 'critical'].includes(parsed.riskLevel) ? parsed.riskLevel : 'medium',
    trustworthinessGrade: parsed.trustworthinessGrade || 'B',
    overallVerdict: String(parsed.overallVerdict || 'Analysis complete'),
    categories: {
      experienceConsistency: normalizeCategory(parsed.categories?.experienceConsistency),
      skillAuthenticity: normalizeCategory(parsed.categories?.skillAuthenticity),
      contentOriginality: normalizeCategory(parsed.categories?.contentOriginality),
      metricRealism: normalizeCategory(parsed.categories?.metricRealism),
      careerProgression: normalizeCategory(parsed.categories?.careerProgression),
      keywordNaturalness: normalizeCategory(parsed.categories?.keywordNaturalness),
    },
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags.map(normalizeRedFlag) : [],
    aiPatterns: Array.isArray(parsed.aiPatterns) ? parsed.aiPatterns.map(p => ({
      pattern: String(p.pattern || ''),
      example: String(p.example || ''),
      confidence: Math.min(100, Math.max(0, parseInt(p.confidence) || 0)),
    })) : [],
    genuineIndicators: Array.isArray(parsed.genuineIndicators)
      ? parsed.genuineIndicators.map(s => typeof s === 'object' ? s.text || JSON.stringify(s) : String(s))
      : [],
    recruiterAdvice: Array.isArray(parsed.recruiterAdvice)
      ? parsed.recruiterAdvice.map(s => typeof s === 'object' ? s.text || JSON.stringify(s) : String(s))
      : [],
  };
};

function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'object') {
    return { score: 50, status: 'warning', findings: [] };
  }
  return {
    score: Math.min(100, Math.max(0, parseInt(cat.score) || 50)),
    status: ['pass', 'warning', 'fail'].includes(cat.status) ? cat.status : 'warning',
    findings: Array.isArray(cat.findings)
      ? cat.findings.map(f => typeof f === 'object' ? f.text || JSON.stringify(f) : String(f))
      : [],
  };
}

function normalizeRedFlag(flag) {
  if (!flag || typeof flag !== 'object') return { severity: 'low', type: 'unknown', title: '', description: '', evidence: '', recommendation: '' };
  return {
    severity: String(flag.severity || 'low'),
    type: String(flag.type || 'unknown'),
    title: String(flag.title || ''),
    description: String(flag.description || ''),
    evidence: String(flag.evidence || ''),
    recommendation: String(flag.recommendation || ''),
  };
}

module.exports = { analyzeAuthenticity, detectIfResume };
