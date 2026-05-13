/**
 * Compare Prompt — Single-Pass Deep Analysis (v2)
 * 
 * 7-criterion scoring system (adds up to 100):
 *   techKnowledge /20 + formatting /15 + completeness /15 +
 *   keywords /20 + impact /20 + language /5 + grammar /5 = 100
 *
 * Performs forensic analysis AND ranking in ONE single API call.
 */

const generateUnifiedComparePrompt = (resumeFiles) => {
  const resumesText = resumeFiles.map((r, i) => `
══════════════════════════════════════════════════════════════
RESUME INDEX: ${i} | RESUME NAME: "${r.name}"
══════════════════════════════════════════════════════════════
${r.text}
`).join('\n\n');

  return `You are a brutally strict HR director, senior technical recruiter, and ATS auditor at a FAANG-level tech company. You are evaluating ${resumeFiles.length} resumes for a highly competitive role. Your job is at stake — you MUST rank them with 100% accuracy based on evidence.

Here are the resumes:
${resumesText}

══════════════════════════════════════════════════════════════
MANDATORY STEP 1: EXTRACT EVIDENCE FROM EACH RESUME
══════════════════════════════════════════════════════════════
Before scoring, you MUST carefully read each resume word by word and extract:
1. Education — exact degree, university, year, GPA/CGPA if mentioned
2. Work Experience — job titles, companies, duration (months/years). If none, write "NOT FOUND"
3. Internships — company, role, duration. If none, write "NOT FOUND"
4. Projects — count them, note tech stacks used in each
5. Technical Skills — list EVERY technology, tool, framework, language mentioned
6. Certifications — list all or "NOT FOUND"
7. Quantified Achievements — quote EXACT bullets that contain numbers/percentages/metrics
8. Missing Sections — which standard sections are absent (Summary, Objective, Education, Experience, Projects, Skills, Certifications, Achievements, Volunteer)

These facts DIRECTLY control your scores. You CANNOT give high scores without evidence.

══════════════════════════════════════════════════════════════
MANDATORY STEP 2: SCORE EACH RESUME (7 criteria, total = 100)
══════════════════════════════════════════════════════════════

CRITERION 1: TECH & KNOWLEDGE (0–20)
  Measures: Depth and breadth of technical expertise demonstrated
  - 18-20: Expert-level. 10+ technologies, uses them IN CONTEXT (not just listed), shows architecture decisions, system design, complex problem solving
  - 14-17: Strong. 7-10 technologies used in real projects with specific technical details
  - 10-13: Average. 5-7 technologies listed but mostly surface-level usage
  - 5-9: Below average. Few technologies, mostly listing without demonstration
  - 0-4: Minimal. Barely any technical content, vague "computer skills"

CRITERION 2: FORMATTING (0–15)
  Measures: ATS-readability and professional layout
  - 13-15: Perfect single-column, standard headings (Education, Experience, Skills), consistent bullet formatting, proper date alignment, no tables/columns that break ATS parsers
  - 9-12: Mostly clean but minor inconsistencies (mixed date formats, some odd spacing)
  - 5-8: Noticeable issues (multi-column, non-standard sections, inconsistent bullets)
  - 0-4: Messy, hard to parse, would fail most ATS systems

CRITERION 3: COMPLETENESS (0–15)
  Measures: Presence of essential resume sections
  - 13-15: Has ALL of: Contact Info, Summary/Objective, Education, Experience OR Projects, Skills, and at least one of (Certifications, Achievements, Volunteer)
  - 9-12: Has most essential sections but missing 1-2 (e.g., no summary, no certifications)
  - 5-8: Missing 3+ important sections
  - 0-4: Severely incomplete, missing fundamental sections

CRITERION 4: KEYWORDS (0–20)
  Measures: Industry-relevant technical terms and buzzwords that ATS systems scan for
  - 18-20: 15+ relevant keywords used naturally in context, covers full tech stack depth
  - 14-17: 10-14 relevant keywords, good coverage of the domain
  - 10-13: 5-9 keywords, some relevant but gaps in coverage
  - 5-9: Few industry terms, mostly generic descriptions
  - 0-4: Almost no technical keywords, would fail ATS keyword matching

CRITERION 5: IMPACT (0–20) ← MOST IMPORTANT FOR HIRING
  Measures: Quantified achievements with real metrics (%, $, users, time saved)
  - 18-20: 5+ bullet points with REAL measurable outcomes ("reduced load time by 40%", "served 10K+ users", "cut costs by $50K/year")
  - 14-17: 3-4 bullets with concrete metrics
  - 10-13: 1-2 bullets with some metrics, rest are task descriptions
  - 5-9: No real metrics but good descriptive project outcomes
  - 0-4: Pure task descriptions ("worked on frontend", "helped with database") — NO measurable results

CRITERION 6: LANGUAGE (0–5)
  Measures: Action verbs, concise writing, professional tone
  - 4-5: Strong action verbs (Developed, Engineered, Optimized, Led), concise bullets, no passive voice
  - 2-3: Mix of action verbs and weak starts ("Responsible for", "Worked on")
  - 0-1: Passive, verbose, unprofessional tone

CRITERION 7: GRAMMAR (0–5)
  Measures: Spelling, punctuation, professional consistency
  - 4-5: Zero errors, perfectly polished, consistent tense
  - 2-3: 1-3 minor errors or inconsistencies
  - 0-1: Multiple spelling/grammar errors, unprofessional

══════════════════════════════════════════════════════════════
CALIBRATION ANCHORS (follow these strictly)
══════════════════════════════════════════════════════════════
- Basic B.Tech student with projects but NO internship & NO metrics → 45-58
- Student with decent projects and 1-2 vague metrics → 55-65
- Fresher with 1 internship + some quantified work → 62-72
- Graduate with 1+ year real work experience + quantified achievements → 72-85
- Senior with 3+ years, leadership, rich metrics → 82-95
- If all resumes are students with similar backgrounds, differentiate on: project quality, tech depth, metrics, and formatting

══════════════════════════════════════════════════════════════
RANKING RULES FOR HIRING MANAGERS
══════════════════════════════════════════════════════════════
1. A candidate with REAL work experience ALWAYS outranks one without (unless the student has exceptionally superior projects with metrics)
2. Quantified impact is the #1 differentiator between similar candidates
3. Tech depth matters: "Built REST API with Node.js, Express, MongoDB, deployed on AWS EC2 with CI/CD" > "Made a web app"
4. More relevant, specific skills > fewer generic ones
5. If two candidates have nearly identical scores (within 3 points), clearly explain the tiebreaker reason

══════════════════════════════════════════════════════════════
RESPOND WITH VALID JSON ONLY — NO MARKDOWN, NO BACKTICKS
══════════════════════════════════════════════════════════════
{
  "winnerIndex": <0-based index of the best resume>,
  "winnerReason": "<3-4 sentences explaining EXACTLY why this resume won. Cite specific experience, projects, metrics, and skills that made it superior. Compare directly against the runner-up.>",
  "overallVerdict": "<2-3 sentences summarizing the candidate pool quality, their experience levels, and the key differentiators>",
  "keyDifferences": [
    "<specific difference #1 — e.g. 'Resume 0 has 6 months internship at XYZ while Resume 1 has no work experience'>",
    "<specific difference #2 — e.g. 'Resume 2 quantified 3 achievements with metrics while others had none'>",
    "<specific difference #3 — e.g. 'Resume 0 uses 12+ technologies in context while Resume 3 only lists 4 generic skills'>"
  ],
  "rankedOrder": [<indices ordered best to worst>],
  "resumes": [
    {
      "index": <0-based index>,
      "resumeName": "<exact file name>",
      "experienceLevel": "<student|fresher|junior|mid|senior>",
      "extractedFacts": {
        "education": "<exact degree and institution found, or NOT FOUND>",
        "workExperience": "<company, role, duration — or NOT FOUND>",
        "internships": "<company, role, duration — or NOT FOUND>",
        "projectCount": <number of distinct projects found>,
        "certifications": "<list of certs — or NOT FOUND>",
        "quantifiedBullets": ["<quote exact metric bullet 1>", "<quote exact metric bullet 2>"],
        "technicalSkills": ["<skill1>", "<skill2>", "<...every tech skill found>"],
        "missingSections": ["<missing section 1>", "<missing section 2>"]
      },
      "scoreJustification": {
        "techKnowledge": "<1-2 sentences: what tech depth was demonstrated, how many technologies used in real context vs just listed>",
        "formatting": "<1 sentence: ATS readability assessment>",
        "completeness": "<1 sentence: which sections present/missing>",
        "keywords": "<1 sentence: keyword count and relevance>",
        "impact": "<1-2 sentences: QUOTE the specific metrics found, or state clearly that NO metrics exist>",
        "language": "<1 sentence: action verb quality>",
        "grammar": "<1 sentence: error count>"
      },
      "scoreBreakdown": {
        "techKnowledge": <0-20>,
        "formatting": <0-15>,
        "completeness": <0-15>,
        "keywords": <0-20>,
        "impact": <0-20>,
        "language": <0-5>,
        "grammar": <0-5>
      },
      "atsScore": <integer — MUST EXACTLY equal techKnowledge + formatting + completeness + keywords + impact + language + grammar>,
      "topStrengths": ["<specific strength 1 with evidence>", "<specific strength 2 with evidence>", "<specific strength 3>"],
      "criticalWeaknesses": ["<specific weakness 1 — be brutally honest>", "<specific weakness 2>", "<specific weakness 3>"],
      "whyItLost": "<If not winner: specifically why this candidate is weaker than the winner, citing exact evidence (e.g. 'Has no internship experience compared to Resume 0 who has 6 months at TCS. Also lacks any quantified achievements.')>",
      "improvementsToWin": ["<actionable improvement 1 with example>", "<actionable improvement 2 with example>", "<actionable improvement 3>"]
    }
  ]
}

ABSOLUTE RULES — VIOLATION = SYSTEM FAILURE:
1. Every resume in the input MUST have an object in the "resumes" array.
2. The "atsScore" MUST EXACTLY equal the sum of the 7 "scoreBreakdown" fields: techKnowledge + formatting + completeness + keywords + impact + language + grammar.
3. The maximum possible total is 100 (20+15+15+20+20+5+5).
4. You MUST NOT inflate scores. Follow calibration anchors strictly.
5. A student with no work experience and no metrics CANNOT score above 65.
6. The "impact" score CANNOT exceed 5 if there are ZERO quantified bullets with real numbers.
7. Output ONLY the raw JSON object, starting with { and ending with }.
8. Every scoreJustification MUST reference specific evidence from the resume.
9. "techKnowledge" score must reflect actual demonstrated technical depth, not just a skills list.
10. Compare candidates AGAINST each other — don't score them in isolation.`;
};

module.exports = { generateUnifiedComparePrompt };
