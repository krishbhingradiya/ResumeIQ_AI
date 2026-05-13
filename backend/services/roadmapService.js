/**
 * Smart Skill Gap Roadmap Generator Service
 * Generates personalized career learning roadmaps based on resume analysis.
 */

const { callAIWithFallback, parseJSON } = require('./aiEngine');

/**
 * Generate a personalized skill gap roadmap
 */
const generateRoadmap = async (resumeText, targetRole) => {
  const truncated = resumeText.length > 3000 ? resumeText.substring(0, 3000) + '\n[TRUNCATED]' : resumeText;

  const prompt = `Create a career roadmap for someone targeting "${targetRole}". Analyze their current skills from the resume and identify gaps.

RESUME:
${truncated}

TARGET ROLE: ${targetRole}

Return VALID JSON ONLY:
{"targetRole":"${targetRole}","currentLevel":"beginner|intermediate|advanced","jobReadinessScore":0-100,"estimatedWeeks":number,"currentSkills":["skill"],"missingSkills":[{"skill":"name","priority":"critical|high|medium|low","currentLevel":"none|beginner|intermediate","targetLevel":"intermediate|advanced|expert","reason":"why needed"}],"roadmapPhases":[{"phase":1,"title":"Phase Title","duration":"Week 1-2","focus":"focus area","skills":["skill"],"tasks":[{"task":"specific task","type":"learn|build|practice","resource":"resource name","estimatedHours":5,"priority":"must-do|recommended|bonus"}],"milestone":"achievement after phase","project":{"title":"project name","description":"what to build","skills":["skill"]}}],"certifications":[{"name":"cert name","provider":"provider","priority":"essential|recommended|optional","estimatedCost":"Free|$XX","timeToComplete":"time"}],"portfolioProjects":[{"title":"project","description":"what to build","techStack":["tech"],"difficulty":"beginner|intermediate|advanced","impactOnResume":"why impressive"}],"weeklyPlan":[{"week":1,"theme":"theme","goals":["goal"],"hoursNeeded":10}],"careerGrowth":{"shortTerm":"3 months outlook","midTerm":"6 months outlook","longTerm":"1 year outlook","salaryRange":"$X-$Y"},"tips":["tip1","tip2","tip3"]}

Generate 3-4 phases with tasks. Include certifications and portfolio projects. Be realistic about timelines.`;

  const text = await callAIWithFallback(prompt, 'You are an expert career coach and learning path designer. Return ONLY valid JSON.', 'Roadmap');
  const parsed = parseJSON(text);

  // Normalize the response
  return {
    targetRole: String(parsed.targetRole || targetRole),
    currentLevel: String(parsed.currentLevel || 'beginner'),
    jobReadinessScore: Math.min(100, Math.max(0, parseInt(parsed.jobReadinessScore) || 30)),
    estimatedWeeks: parseInt(parsed.estimatedWeeks) || 8,
    currentSkills: normalizeStringArray(parsed.currentSkills),
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills.map(normalizeMissingSkill) : [],
    roadmapPhases: Array.isArray(parsed.roadmapPhases) ? parsed.roadmapPhases.map(normalizePhase) : [],
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications.map(normalizeCert) : [],
    portfolioProjects: Array.isArray(parsed.portfolioProjects) ? parsed.portfolioProjects.map(normalizeProject) : [],
    weeklyPlan: Array.isArray(parsed.weeklyPlan) ? parsed.weeklyPlan.map(normalizeWeek) : [],
    careerGrowth: {
      shortTerm: String(parsed.careerGrowth?.shortTerm || ''),
      midTerm: String(parsed.careerGrowth?.midTerm || ''),
      longTerm: String(parsed.careerGrowth?.longTerm || ''),
      salaryRange: String(parsed.careerGrowth?.salaryRange || ''),
    },
    tips: normalizeStringArray(parsed.tips),
  };
};

function normalizeStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(s => typeof s === 'object' ? (s.text || s.name || JSON.stringify(s)) : String(s));
}

function normalizeMissingSkill(s) {
  if (!s || typeof s !== 'object') return { skill: String(s || ''), priority: 'medium', currentLevel: 'none', targetLevel: 'intermediate', reason: '' };
  return {
    skill: String(s.skill || s.name || ''),
    priority: String(s.priority || 'medium'),
    currentLevel: String(s.currentLevel || 'none'),
    targetLevel: String(s.targetLevel || 'intermediate'),
    reason: String(s.reason || ''),
  };
}

function normalizePhase(p) {
  if (!p || typeof p !== 'object') return { phase: 1, title: '', duration: '', focus: '', skills: [], tasks: [], milestone: '', project: null };
  return {
    phase: parseInt(p.phase) || 1,
    title: String(p.title || ''),
    duration: String(p.duration || ''),
    focus: String(p.focus || ''),
    skills: normalizeStringArray(p.skills),
    tasks: Array.isArray(p.tasks) ? p.tasks.map(t => ({
      task: String(t?.task || ''),
      type: String(t?.type || 'learn'),
      resource: String(t?.resource || ''),
      estimatedHours: parseInt(t?.estimatedHours) || 2,
      priority: String(t?.priority || 'recommended'),
    })) : [],
    milestone: String(p.milestone || ''),
    project: p.project ? {
      title: String(p.project.title || ''),
      description: String(p.project.description || ''),
      skills: normalizeStringArray(p.project.skills),
    } : null,
  };
}

function normalizeCert(c) {
  if (!c || typeof c !== 'object') return { name: '', provider: '', priority: 'optional', estimatedCost: '', timeToComplete: '' };
  return {
    name: String(c.name || ''),
    provider: String(c.provider || ''),
    priority: String(c.priority || 'optional'),
    estimatedCost: String(c.estimatedCost || 'Free'),
    timeToComplete: String(c.timeToComplete || ''),
  };
}

function normalizeProject(p) {
  if (!p || typeof p !== 'object') return { title: '', description: '', techStack: [], difficulty: 'beginner', impactOnResume: '' };
  return {
    title: String(p.title || ''),
    description: String(p.description || ''),
    techStack: normalizeStringArray(p.techStack),
    difficulty: String(p.difficulty || 'beginner'),
    impactOnResume: String(p.impactOnResume || ''),
  };
}

function normalizeWeek(w) {
  if (!w || typeof w !== 'object') return { week: 1, theme: '', goals: [], hoursNeeded: 10 };
  return {
    week: parseInt(w.week) || 1,
    theme: String(w.theme || ''),
    goals: normalizeStringArray(w.goals),
    hoursNeeded: parseInt(w.hoursNeeded) || 10,
  };
}

module.exports = { generateRoadmap };
