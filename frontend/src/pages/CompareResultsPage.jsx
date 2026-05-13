import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTrophyLine, RiScales3Line, RiArrowLeftLine, RiUploadCloud2Line,
  RiCheckboxCircleLine, RiCloseCircleLine, RiLightbulbLine, RiBarChartBoxLine,
  RiMedalLine, RiSparklingFill
} from 'react-icons/ri';
import CareerChat from '../components/CareerChat';

const BREAKDOWN_ITEMS = [
  { label: 'Tech & Knowledge', key: 'techKnowledge', max: 20, color: 'from-fuchsia-500 to-pink-500' },
  { label: 'Formatting',       key: 'formatting',    max: 15, color: 'from-cyan-500 to-blue-500' },
  { label: 'Completeness',     key: 'completeness',  max: 15, color: 'from-emerald-500 to-teal-500' },
  { label: 'Keywords',         key: 'keywords',      max: 20, color: 'from-violet-500 to-purple-500' },
  { label: 'Impact',           key: 'impact',        max: 20, color: 'from-amber-500 to-orange-500' },
  { label: 'Language',         key: 'language',      max: 5,  color: 'from-pink-500 to-rose-500' },
  { label: 'Grammar',          key: 'grammar',       max: 5,  color: 'from-primary-500 to-accent-500' },
];

const LEVEL_LABELS = {
  student: '🎓 Student', fresher: '🌱 Fresher', junior: '💼 Junior',
  mid: '⚡ Mid-Level', senior: '🏆 Senior',
};

const LEVEL_COLORS = {
  student: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  fresher: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  junior:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  mid:     'bg-violet-500/20 text-violet-300 border-violet-500/30',
  senior:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const ScoreBar = ({ value, max, color, delay = 0 }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 overflow-hidden rounded-full bg-dark-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut', delay }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
};

const CompareResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const comparison = location.state?.comparison;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (!comparison) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-500/10">
          <RiScales3Line className="h-10 w-10 text-primary-400" />
        </div>
        <h2 className="mb-3 font-display text-2xl font-bold text-white">No Comparison Data</h2>
        <p className="mb-8 max-w-md text-dark-400">Upload resumes to compare first.</p>
        <Link to="/compare" className="btn-gradient !rounded-2xl">
          <RiScales3Line className="h-5 w-5" /> Compare Resumes
        </Link>
      </motion.div>
    );
  }

  const { resumes = [], winnerIndex, winnerReason, keyDifferences = [], overallVerdict } = comparison;
  const winner = resumes[winnerIndex] ?? resumes.find(r => r.rank === 1);
  const sorted = [...resumes].sort((a, b) => a.rank - b.rank);

  const rankBadge = (rank) => {
    if (rank === 1) return { icon: <RiTrophyLine className="h-5 w-5" />, cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: '🥇 Winner' };
    if (rank === 2) return { icon: <RiMedalLine className="h-5 w-5" />, cls: 'bg-slate-500/20 text-slate-300 border-slate-500/40', label: '🥈 Runner-up' };
    return { icon: <RiBarChartBoxLine className="h-5 w-5" />, cls: 'bg-dark-800 text-dark-400 border-dark-700', label: `#${rank}` };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 sm:pt-32">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/3 h-96 w-96 bg-primary-500" />
        <div className="gradient-orb right-1/4 bottom-1/3 h-80 w-80 bg-accent-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button onClick={() => navigate('/compare')}
              className="mb-3 flex items-center gap-1.5 text-sm text-dark-400 transition-colors hover:text-white">
              <RiArrowLeftLine className="h-4 w-4" /> Back to Compare
            </button>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              <RiScales3Line className="mr-2 inline h-7 w-7 text-primary-400" />
              Resume <span className="gradient-text">Battle Results</span>
            </h1>
          </div>
          <Link to="/compare" className="btn-outline !rounded-xl !py-2.5 !text-sm">
            <RiUploadCloud2Line className="h-4 w-4" /> Compare Again
          </Link>
        </div>

        {/* ═══ WINNER BANNER ═══ */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-primary-500/20 to-accent-500/30 blur-xl" />
            <div className="glass-card relative overflow-hidden rounded-3xl p-8 text-center sm:p-10">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
                className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20">
                <RiTrophyLine className="h-9 w-9 text-amber-400" />
              </motion.div>
              <p className="mb-1 text-sm font-medium text-amber-400 uppercase tracking-widest">🏆 Winner</p>
              <h2 className="mb-2 font-display text-2xl font-bold text-white sm:text-3xl">
                {winner?.fileName || `Resume ${(winnerIndex ?? 0) + 1}`}
              </h2>
              <p className="mb-4 text-4xl font-black text-white">
                {winner?.atsScore}<span className="text-lg font-normal text-dark-400">/100</span>
              </p>
              <p className="mx-auto max-w-2xl text-sm text-dark-300 leading-relaxed">{winnerReason}</p>
            </div>
          </div>
        </motion.div>

        {/* ═══ OVERALL VERDICT ═══ */}
        {overallVerdict && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <RiSparklingFill className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-400" />
                <p className="text-sm text-dark-300 leading-relaxed">{overallVerdict}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ SCORE COMPARISON TABLE ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h3 className="mb-6 font-display text-lg font-semibold text-white">
              📊 Score Comparison — All Resumes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-left text-dark-500 font-medium">Criterion</th>
                    {sorted.map((r) => (
                      <th key={r.index} className={`pb-3 text-center font-semibold ${r.rank === 1 ? 'text-amber-300' : 'text-dark-300'}`}>
                        {r.fileName}
                        <span className={`ml-2 inline-block rounded-full px-1.5 py-0.5 text-xs ${r.rank === 1 ? 'bg-amber-500/20' : 'bg-dark-800'}`}>
                          #{r.rank}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {BREAKDOWN_ITEMS.map(({ label, key, max }) => (
                    <tr key={key}>
                      <td className="py-3 text-dark-400">{label} <span className="text-dark-600">/{max}</span></td>
                      {sorted.map((r) => {
                        const val = r.scoreBreakdown?.[key] ?? 0;
                        const isTopForCriterion = sorted.every(other => (other.scoreBreakdown?.[key] ?? 0) <= val);
                        return (
                          <td key={r.index} className={`py-3 text-center font-semibold ${isTopForCriterion ? 'text-emerald-400' : 'text-dark-300'}`}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t border-white/10">
                    <td className="py-3 font-semibold text-white">Total ATS Score</td>
                    {sorted.map((r) => (
                      <td key={r.index} className={`py-3 text-center text-lg font-black ${r.rank === 1 ? 'text-amber-300' : 'text-dark-300'}`}>
                        {r.atsScore}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* ═══ KEY DIFFERENCES ═══ */}
        {keyDifferences.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <h3 className="mb-5 font-display text-lg font-semibold text-white">⚡ Key Differences</h3>
              <div className="space-y-3">
                {keyDifferences.map((diff, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-bold text-primary-400">
                      {i + 1}
                    </span>
                    <p className="text-sm text-dark-300">{diff}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ INDIVIDUAL RESUME CARDS ═══ */}
        <div className="space-y-6">
          {sorted.map((resume, idx) => {
            const badge = rankBadge(resume.rank);
            const isWinner = resume.rank === 1;
            return (
              <motion.div key={resume.index}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}>
                <div className={`relative ${isWinner ? '' : ''}`}>
                  {isWinner && (
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500/40 to-orange-500/20 blur-sm" />
                  )}
                  <div className={`glass-card relative rounded-2xl p-6 sm:p-8 ${isWinner ? 'border border-amber-500/20' : ''}`}>
                    {/* Card Header */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge.cls}`}>
                        {badge.icon} {badge.label}
                      </span>
                      <h3 className="font-display text-lg font-bold text-white flex-1 min-w-0 truncate">
                        {resume.fileName}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${LEVEL_COLORS[resume.experienceLevel] || 'bg-dark-800 text-dark-400 border-dark-700'}`}>
                        {LEVEL_LABELS[resume.experienceLevel] || resume.experienceLevel}
                      </span>
                      <span className={`text-3xl font-black ${isWinner ? 'text-amber-300' : 'text-dark-200'}`}>
                        {resume.atsScore}<span className="text-sm font-normal text-dark-500">/100</span>
                      </span>
                    </div>

                    {/* Score bars */}
                    <div className="mb-6 space-y-3">
                      {BREAKDOWN_ITEMS.map(({ label, key, max, color }, bi) => (
                        <div key={key}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-dark-400">{label}</span>
                            <span className="font-semibold text-dark-200">
                              {resume.scoreBreakdown?.[key] ?? 0}<span className="text-dark-600">/{max}</span>
                            </span>
                          </div>
                          <ScoreBar value={resume.scoreBreakdown?.[key] ?? 0} max={max} color={color} delay={0.4 + bi * 0.05} />
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Strengths */}
                      <div>
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          <RiCheckboxCircleLine className="h-4 w-4" /> Top Strengths
                        </p>
                        <ul className="space-y-2">
                          {resume.topStrengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-dark-300">
                              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div>
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
                          <RiCloseCircleLine className="h-4 w-4" /> Critical Weaknesses
                        </p>
                        <ul className="space-y-2">
                          {resume.criticalWeaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-dark-300">
                              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Why it lost */}
                    {!isWinner && resume.whyItLost && (
                      <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                          ❓ Why it ranked lower
                        </p>
                        <p className="text-xs text-dark-300 leading-relaxed">{resume.whyItLost}</p>
                      </div>
                    )}

                    {/* Improvements */}
                    {!isWinner && resume.improvementsToWin?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-400">
                          <RiLightbulbLine className="h-4 w-4" /> How to close the gap
                        </p>
                        <ul className="space-y-2">
                          {resume.improvementsToWin.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 rounded-lg bg-primary-500/5 p-3 text-xs text-dark-300">
                              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-xs font-bold text-primary-400">
                                {i + 1}
                              </span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ── AI Evidence Panel ── */}
                    {resume.extractedFacts && Object.keys(resume.extractedFacts).length > 0 && (
                      <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-dark-500">
                          🔍 What AI Read From This Resume
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {resume.extractedFacts.education && (
                            <div className="rounded-lg bg-dark-800/60 p-2.5">
                              <p className="text-[10px] uppercase tracking-wider text-dark-600 mb-0.5">Education</p>
                              <p className="text-xs text-dark-300">{resume.extractedFacts.education}</p>
                            </div>
                          )}
                          {resume.extractedFacts.workExperience && (
                            <div className="rounded-lg bg-dark-800/60 p-2.5">
                              <p className="text-[10px] uppercase tracking-wider text-dark-600 mb-0.5">Work Experience</p>
                              <p className="text-xs text-dark-300">{resume.extractedFacts.workExperience}</p>
                            </div>
                          )}
                          {resume.extractedFacts.projectCount !== undefined && (
                            <div className="rounded-lg bg-dark-800/60 p-2.5">
                              <p className="text-[10px] uppercase tracking-wider text-dark-600 mb-0.5">Projects Found</p>
                              <p className="text-xs text-dark-300">{resume.extractedFacts.projectCount} project(s)</p>
                            </div>
                          )}
                          {resume.extractedFacts.certifications && (
                            <div className="rounded-lg bg-dark-800/60 p-2.5">
                              <p className="text-[10px] uppercase tracking-wider text-dark-600 mb-0.5">Certifications</p>
                              <p className="text-xs text-dark-300">{resume.extractedFacts.certifications}</p>
                            </div>
                          )}
                        </div>
                        {/* Quantified bullets */}
                        {Array.isArray(resume.extractedFacts.quantifiedBullets) && resume.extractedFacts.quantifiedBullets.length > 0 && (
                          <div className="mt-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-600 mb-1">
                              Quantified Achievements Found ({resume.extractedFacts.quantifiedBullets.length})
                            </p>
                            <ul className="space-y-1">
                              {resume.extractedFacts.quantifiedBullets.map((b, bi) => (
                                <li key={bi} className="text-xs text-emerald-300/80 flex items-start gap-1.5">
                                  <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(resume.extractedFacts.quantifiedBullets) && resume.extractedFacts.quantifiedBullets.length === 0 && (
                          <div className="mt-2 rounded-lg bg-red-500/5 border border-red-500/10 p-2.5">
                            <p className="text-xs text-red-400/70">⚠ No quantified achievements found — all bullet points are task descriptions</p>
                          </div>
                        )}
                        {/* Score justification per criterion */}
                        {resume.scoreJustification && Object.keys(resume.scoreJustification).length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wider text-dark-600">Score Justifications</p>
                            {Object.entries(resume.scoreJustification).map(([key, reason]) => (
                              <div key={key} className="flex gap-2 text-xs">
                                <span className="flex-shrink-0 capitalize text-dark-500 w-20">{key}:</span>
                                <span className="text-dark-400">{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/recruiter" state={{ comparison }} className="btn-gradient !rounded-2xl">
            <RiBarChartBoxLine className="h-5 w-5" /> Recruiter Dashboard
          </Link>
          <Link to="/compare" className="btn-outline !rounded-2xl">
            <RiScales3Line className="h-5 w-5" /> Compare New Resumes
          </Link>
          <Link to="/upload" className="btn-outline !rounded-2xl">
            <RiUploadCloud2Line className="h-5 w-5" /> Analyze Single Resume
          </Link>
        </div>
      </div>

      {/* AI Career Chat — Floating */}
      <CareerChat analysisContext={comparison} />
    </motion.div>
  );
};

export default CompareResultsPage;
