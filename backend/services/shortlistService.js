/**
 * Recruiter AI Shortlisting Service
 * Ranks and scores multiple candidates against a target role or JD.
 */

const { callAIWithFallback, parseJSON } = require('./aiEngine');

const str = (v) => typeof v === 'object' ? (v?.text || v?.name || JSON.stringify(v)) : String(v || '');
const strArr = (arr) => Array.isArray(arr) ? arr.map(str) : [];

/**
 * AI-powered candidate shortlisting and ranking
 */
const shortlistCandidates = async (candidateTexts, targetRole, jobDescription = '') => {
  // Truncate each candidate to limit total token usage
  const maxPerCandidate = Math.floor(6000 / candidateTexts.length);
  const candidateBlocks = candidateTexts.map((t, i) => {
    const truncated = t.length > maxPerCandidate ? t.substring(0, maxPerCandidate) + '\n[TRUNCATED]' : t;
    return `--- CANDIDATE ${i + 1} ---\n${truncated}\n--- END ---`;
  }).join('\n');

  const jdContext = jobDescription
    ? `JOB DESCRIPTION: ${jobDescription.substring(0, 1000)}\nRank for this JD.`
    : `TARGET ROLE: ${targetRole}\nRank for "${targetRole}" position.`;

  const prompt = `Rank ${candidateTexts.length} candidates for hiring.

${candidateBlocks}
${jdContext}

Return VALID JSON ONLY:
{"targetRole":"${targetRole || 'Based on JD'}","totalCandidates":${candidateTexts.length},"rankings":[{"rank":1,"candidateId":1,"name":"extracted name","hiringScore":0-100,"hiringProbability":"high|medium|low","interviewPriority":"must-interview|recommended|optional|skip","matchPercentage":0-100,"experienceLevel":"student|fresher|junior|mid|senior","strengths":["strength"],"weaknesses":["weakness"],"keySkillsMatch":["skill"],"missingSkills":["skill"],"standoutFactor":"what makes special","riskFactors":["concern"],"recruiterNote":"recommendation"}],"comparison":{"technicalDepth":[{"candidateId":1,"score":0-100}],"impactMetrics":[{"candidateId":1,"score":0-100}],"atsReadiness":[{"candidateId":1,"score":0-100}],"skillAlignment":[{"candidateId":1,"score":0-100}],"cultureFit":[{"candidateId":1,"score":0-100}]},"topCandidate":{"candidateId":1,"reason":"why best"},"hiringInsights":["insight"],"interviewPlan":[{"candidateId":1,"name":"name","suggestedRound":"technical|behavioral","focusAreas":["area"]}]}

Rank ALL ${candidateTexts.length} candidates. Be fair and evidence-based.`;

  const text = await callAIWithFallback(prompt, 'You are an expert enterprise recruiter AI. Return ONLY valid JSON.', 'Shortlist');
  const parsed = parseJSON(text);

  return {
    targetRole: str(parsed.targetRole) || targetRole || 'General',
    totalCandidates: candidateTexts.length,
    rankings: Array.isArray(parsed.rankings) ? parsed.rankings.map(normalizeRanking) : [],
    comparison: normalizeComparison(parsed.comparison, candidateTexts.length),
    topCandidate: {
      candidateId: parseInt(parsed.topCandidate?.candidateId) || 1,
      reason: str(parsed.topCandidate?.reason),
    },
    hiringInsights: strArr(parsed.hiringInsights),
    interviewPlan: Array.isArray(parsed.interviewPlan) ? parsed.interviewPlan.map(p => ({
      candidateId: parseInt(p?.candidateId) || 1,
      name: str(p?.name),
      suggestedRound: str(p?.suggestedRound),
      focusAreas: strArr(p?.focusAreas),
    })) : [],
  };
};

function normalizeRanking(r) {
  if (!r || typeof r !== 'object') return {};
  return {
    rank: parseInt(r.rank) || 1,
    candidateId: parseInt(r.candidateId) || 1,
    name: str(r.name),
    hiringScore: Math.min(100, Math.max(0, parseInt(r.hiringScore) || 0)),
    hiringProbability: str(r.hiringProbability) || 'medium',
    interviewPriority: str(r.interviewPriority) || 'recommended',
    matchPercentage: Math.min(100, Math.max(0, parseInt(r.matchPercentage) || 0)),
    experienceLevel: str(r.experienceLevel) || 'unknown',
    strengths: strArr(r.strengths),
    weaknesses: strArr(r.weaknesses),
    keySkillsMatch: strArr(r.keySkillsMatch),
    missingSkills: strArr(r.missingSkills),
    standoutFactor: str(r.standoutFactor),
    riskFactors: strArr(r.riskFactors),
    recruiterNote: str(r.recruiterNote),
  };
}

function normalizeComparison(comp, count) {
  const defaultArr = Array.from({ length: count }, (_, i) => ({ candidateId: i + 1, score: 50 }));
  if (!comp || typeof comp !== 'object') {
    return { technicalDepth: defaultArr, impactMetrics: defaultArr, atsReadiness: defaultArr, skillAlignment: defaultArr, cultureFit: defaultArr };
  }
  const norm = (arr) => Array.isArray(arr) ? arr.map(a => ({
    candidateId: parseInt(a?.candidateId) || 1,
    score: Math.min(100, Math.max(0, parseInt(a?.score) || 50)),
  })) : defaultArr;
  return {
    technicalDepth: norm(comp.technicalDepth),
    impactMetrics: norm(comp.impactMetrics),
    atsReadiness: norm(comp.atsReadiness),
    skillAlignment: norm(comp.skillAlignment),
    cultureFit: norm(comp.cultureFit),
  };
}

module.exports = { shortlistCandidates };
