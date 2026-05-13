import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import {
  RiCrosshairLine, RiCheckboxCircleLine, RiCloseCircleLine, RiLightbulbLine,
  RiAlertLine, RiArrowLeftLine, RiShieldCheckLine, RiThunderstormsLine,
  RiSparklingFill, RiFileTextLine
} from 'react-icons/ri';

const PROBABILITY_COLORS = {
  very_low: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: '🔴 Very Low' },
  low: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', label: '🟠 Low' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: '🟡 Moderate' },
  high: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: '🟢 High' },
  very_high: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', label: '🟢 Very High' },
};

const JDResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const fileName = location.state?.fileName;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  if (!result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <RiCrosshairLine className="mb-4 h-12 w-12 text-dark-600" />
        <h2 className="mb-3 font-display text-2xl font-bold text-white">No Match Data</h2>
        <p className="mb-6 text-dark-400">Run a JD match first to see results.</p>
        <Link to="/jd-match" className="btn-gradient !rounded-2xl">
          <RiCrosshairLine className="h-5 w-5" /> Match Resume to JD
        </Link>
      </motion.div>
    );
  }

  const { matchPercentage, hiringProbability, hiringProbabilityPercent, overallVerdict, jdTitle, jdCompany,
    matchedKeywords = [], missingKeywords = [], missingTechnicalSkills = [], missingSoftSkills = [],
    matchBreakdown = {}, atsOptimizationTips = [], resumeImprovements = [], strengths = [], dealBreakers = []
  } = result;

  const prob = PROBABILITY_COLORS[hiringProbability] || PROBABILITY_COLORS.moderate;
  const matchColor = matchPercentage >= 80 ? 'text-emerald-400' : matchPercentage >= 60 ? 'text-amber-400' : 'text-red-400';

  const radarData = Object.entries(matchBreakdown).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    score: val?.score || 0,
    fullMark: 100
  }));

  const barData = [
    { name: 'Matched', value: matchedKeywords.length, fill: '#34d399' },
    { name: 'Missing', value: missingKeywords.length, fill: '#f87171' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/3 h-96 w-96 bg-emerald-500" />
        <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-primary-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button onClick={() => navigate('/jd-match')}
              className="mb-3 flex items-center gap-1.5 text-sm text-dark-400 transition-colors hover:text-white">
              <RiArrowLeftLine className="h-4 w-4" /> Back to JD Match
            </button>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              <RiCrosshairLine className="mr-2 inline h-7 w-7 text-emerald-400" />
              Match <span className="gradient-text">Results</span>
            </h1>
          </div>
          <Link to="/jd-match" className="btn-outline !rounded-xl !py-2.5 !text-sm">
            <RiCrosshairLine className="h-4 w-4" /> New Match
          </Link>
        </div>

        {/* ═══ MATCH SCORE HERO ═══ */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="relative">
            <div className={`absolute -inset-1 rounded-3xl blur-xl ${matchPercentage >= 70 ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`} />
            <div className="glass-card relative overflow-hidden rounded-3xl p-8 text-center sm:p-10">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-3 text-xs text-dark-500">
                <span className="flex items-center gap-1"><RiFileTextLine className="h-3.5 w-3.5" /> {fileName || 'Resume'}</span>
                <span>→</span>
                <span className="font-semibold text-dark-300">{jdTitle} {jdCompany !== 'Not specified' ? `@ ${jdCompany}` : ''}</span>
              </div>
              <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className={`text-7xl font-black ${matchColor}`}>
                {matchPercentage}<span className="text-2xl font-normal text-dark-500">%</span>
              </motion.p>
              <p className="mt-1 text-sm font-medium text-dark-400 uppercase tracking-wider">Match Score</p>

              <div className="mt-4 flex items-center justify-center gap-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold ${prob.bg} ${prob.text} ${prob.border}`}>
                  {prob.label} Hiring Probability
                </span>
              </div>
              <p className="mt-4 mx-auto max-w-2xl text-sm text-dark-300 leading-relaxed">{overallVerdict}</p>
            </div>
          </div>
        </motion.div>

        {/* ═══ CHARTS ROW ═══ */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="glass-card p-6">
                <h3 className="mb-4 font-display text-base font-semibold text-white">📊 Match Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#34d399" fill="#34d399" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Keywords Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="glass-card p-6">
              <h3 className="mb-4 font-display text-base font-semibold text-white">🔑 Keyword Coverage</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ═══ MATCHED KEYWORDS ═══ */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-emerald-400">
                <RiCheckboxCircleLine className="h-5 w-5" /> Matched Keywords ({matchedKeywords.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {matchedKeywords.map((kw, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-xs">
                    <RiCheckboxCircleLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-emerald-300">{kw.keyword}</span>
                      {kw.foundIn && <span className="ml-2 text-dark-500">in {kw.foundIn}</span>}
                      <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] uppercase ${
                        kw.strength === 'strong' ? 'bg-emerald-500/20 text-emerald-400' :
                        kw.strength === 'moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      }`}>{kw.strength}</span>
                    </div>
                  </div>
                ))}
                {matchedKeywords.length === 0 && <p className="text-sm text-dark-600">No matched keywords found</p>}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-red-400">
                <RiCloseCircleLine className="h-5 w-5" /> Missing Keywords ({missingKeywords.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {missingKeywords.map((kw, i) => (
                  <div key={i} className="rounded-lg bg-red-500/5 border border-red-500/10 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <RiCloseCircleLine className="h-4 w-4 flex-shrink-0 text-red-400" />
                      <span className="font-semibold text-red-300">{kw.keyword}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase ${
                        kw.importance === 'critical' ? 'bg-red-500/20 text-red-400' :
                        kw.importance === 'important' ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-800 text-dark-400'
                      }`}>{kw.importance}</span>
                    </div>
                    {kw.suggestion && <p className="mt-1 ml-6 text-dark-400">{kw.suggestion}</p>}
                  </div>
                ))}
                {missingKeywords.length === 0 && <p className="text-sm text-dark-600">No missing keywords — great match!</p>}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ MISSING SKILLS ═══ */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {missingTechnicalSkills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="glass-card p-6">
                <h3 className="mb-4 font-display text-base font-semibold text-white">🛠️ Missing Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {missingTechnicalSkills.map((s, i) => (
                    <span key={i} className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {missingSoftSkills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="glass-card p-6">
                <h3 className="mb-4 font-display text-base font-semibold text-white">🤝 Missing Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {missingSoftSkills.map((s, i) => (
                    <span key={i} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ═══ ATS OPTIMIZATION TIPS ═══ */}
        {atsOptimizationTips.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiLightbulbLine className="h-5 w-5 text-accent-400" /> ATS Optimization Tips
              </h3>
              <div className="space-y-3">
                {atsOptimizationTips.map((tip, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                    className="flex items-start gap-3 rounded-xl bg-accent-500/5 border border-accent-500/10 p-4 text-xs text-dark-300">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-[10px] font-bold text-accent-400">{i + 1}</span>
                    {tip}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ DEAL BREAKERS + STRENGTHS ═══ */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {strengths.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="glass-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-emerald-400">
                  <RiShieldCheckLine className="h-5 w-5" /> Your Strengths for This Role
                </h3>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-dark-300">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
          {dealBreakers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              <div className="glass-card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-red-400">
                  <RiAlertLine className="h-5 w-5" /> Deal Breakers
                </h3>
                <ul className="space-y-2">
                  {dealBreakers.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-dark-300">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* ═══ RESUME IMPROVEMENT SUGGESTIONS ═══ */}
        {resumeImprovements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-8">
            <div className="glass-card p-6">
              <h3 className="mb-5 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiSparklingFill className="h-5 w-5 text-primary-400" /> Suggested Resume Improvements
              </h3>
              <div className="space-y-4">
                {resumeImprovements.map((imp, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-400">{imp.section}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                        <p className="mb-1 text-[10px] uppercase tracking-wider text-red-500">Current</p>
                        <p className="text-xs text-dark-400">{imp.current || 'Missing'}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                        <p className="mb-1 text-[10px] uppercase tracking-wider text-emerald-500">Suggested</p>
                        <p className="text-xs text-dark-300">{imp.suggested}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/jd-match" className="btn-gradient !rounded-2xl">
            <RiCrosshairLine className="h-5 w-5" /> Try Another Match
          </Link>
          <Link to="/upload" className="btn-outline !rounded-2xl">
            <RiFileTextLine className="h-5 w-5" /> Full Resume Analysis
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default JDResultsPage;
