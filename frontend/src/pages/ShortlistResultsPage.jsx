import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTeamLine, RiArrowLeftLine, RiUploadCloud2Line, RiTrophyLine,
  RiMedalLine, RiStarLine, RiCheckboxCircleLine, RiAlertLine,
  RiUserLine, RiShieldCheckLine, RiLightbulbLine, RiEyeLine
} from 'react-icons/ri';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#34d399', '#f87171', '#3b82f6', '#a855f7', '#14b8a6', '#ef4444'];

const ShortlistResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  if (!results) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <RiTeamLine className="mb-4 h-16 w-16 text-violet-400" />
        <h2 className="mb-3 font-display text-2xl font-bold text-white">No Shortlist Data</h2>
        <p className="mb-8 text-dark-400">Upload resumes to start shortlisting.</p>
        <Link to="/shortlist" className="btn-gradient !rounded-2xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
          <RiUploadCloud2Line className="h-5 w-5" /> Start Shortlisting
        </Link>
      </motion.div>
    );
  }

  const { targetRole, rankings, comparison, topCandidate, hiringInsights, interviewPlan } = results;

  const priorityColors = { 'must-interview': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', 'recommended': 'bg-blue-500/20 text-blue-300 border-blue-500/30', 'optional': 'bg-amber-500/20 text-amber-300 border-amber-500/30', 'skip': 'bg-red-500/20 text-red-300 border-red-500/30' };
  const probColors = { high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-red-400' };

  // Prepare bar chart data
  const barData = rankings?.map(r => ({ name: r.name?.split(' ')[0] || `#${r.candidateId}`, score: r.hiringScore, fill: COLORS[(r.candidateId - 1) % COLORS.length] })) || [];

  // Radar data from comparison
  const radarData = comparison ? [
    { metric: 'Technical', ...Object.fromEntries(comparison.technicalDepth?.map(c => [`c${c.candidateId}`, c.score]) || []) },
    { metric: 'Impact', ...Object.fromEntries(comparison.impactMetrics?.map(c => [`c${c.candidateId}`, c.score]) || []) },
    { metric: 'ATS', ...Object.fromEntries(comparison.atsReadiness?.map(c => [`c${c.candidateId}`, c.score]) || []) },
    { metric: 'Skills', ...Object.fromEntries(comparison.skillAlignment?.map(c => [`c${c.candidateId}`, c.score]) || []) },
    { metric: 'Culture', ...Object.fromEntries(comparison.cultureFit?.map(c => [`c${c.candidateId}`, c.score]) || []) },
  ] : [];

  const rankMedals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/3 h-96 w-96 bg-violet-500" />
        <div className="gradient-orb right-1/4 bottom-1/3 h-80 w-80 bg-pink-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button onClick={() => navigate('/shortlist')} className="mb-3 flex items-center gap-1.5 text-sm text-dark-400 hover:text-white">
              <RiArrowLeftLine className="h-4 w-4" /> Back
            </button>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              <RiTeamLine className="mr-2 inline h-7 w-7 text-violet-400" />
              Candidate <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Rankings</span>
            </h1>
            <p className="mt-1 text-sm text-dark-500">{rankings?.length || 0} candidates ranked for {targetRole}</p>
          </div>
          <Link to="/shortlist" className="btn-gradient !rounded-xl !py-2.5 !text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
            <RiUploadCloud2Line className="h-4 w-4" /> New Shortlist
          </Link>
        </div>

        {/* Top Candidate Banner */}
        {topCandidate && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-6">
              <div className="absolute right-4 top-4 text-6xl opacity-10">🏆</div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
                  <RiTrophyLine className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Top Candidate</p>
                  <h3 className="text-xl font-bold text-white">{rankings?.find(r => r.candidateId === topCandidate.candidateId)?.name || `Candidate ${topCandidate.candidateId}`}</h3>
                  <p className="mt-1 text-sm text-dark-300">{topCandidate.reason}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Hiring Score Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <h3 className="mb-4 font-display text-base font-semibold text-white">Hiring Score Leaderboard</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Comparison Radar */}
          {radarData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h3 className="mb-4 font-display text-base font-semibold text-white">Skill Comparison Radar</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  {rankings?.slice(0, 4).map((r, i) => (
                    <Radar key={i} name={r.name} dataKey={`c${r.candidateId}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {rankings?.slice(0, 4).map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-[10px] text-dark-400">{r.name?.split(' ')[0] || `#${r.candidateId}`}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Candidate Rankings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <RiMedalLine className="h-5 w-5 text-amber-400" /> Candidate Rankings
          </h3>
          <div className="space-y-4">
            {rankings?.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                className={`glass-card-hover rounded-2xl p-5 ${r.rank === 1 ? 'ring-1 ring-emerald-500/30' : ''}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    {/* Rank badge */}
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${r.rank <= 3 ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-dark-800'}`}>
                      <span className="text-xl">{rankMedals[r.rank - 1] || `#${r.rank}`}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{r.name}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${priorityColors[r.interviewPriority] || priorityColors.optional}`}>{r.interviewPriority?.replace('-', ' ')}</span>
                        <span className="text-xs text-dark-400 capitalize">{r.experienceLevel}</span>
                        <span className={`text-xs font-semibold ${probColors[r.hiringProbability] || 'text-dark-400'}`}>
                          {r.hiringProbability === 'high' ? '🟢' : r.hiringProbability === 'medium' ? '🟡' : '🔴'} {r.hiringProbability} probability
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex gap-4 sm:text-right">
                    <div>
                      <p className="text-xs text-dark-500">Hiring Score</p>
                      <p className={`text-2xl font-bold ${r.hiringScore >= 75 ? 'text-emerald-400' : r.hiringScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{r.hiringScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Match</p>
                      <p className="text-2xl font-bold text-violet-400">{r.matchPercentage}%</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {/* Strengths */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Strengths</p>
                    <div className="space-y-1">
                      {r.strengths?.map((s, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <RiCheckboxCircleLine className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                          <span className="text-xs text-dark-300">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500">Weaknesses</p>
                    <div className="space-y-1">
                      {r.weaknesses?.map((w, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <RiAlertLine className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
                          <span className="text-xs text-dark-300">{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.keySkillsMatch?.map((s, j) => <span key={j} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/20">{s}</span>)}
                  {r.missingSkills?.map((s, j) => <span key={`m${j}`} className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300 border border-red-500/20">✗ {s}</span>)}
                </div>

                {/* Standout & Note */}
                {r.standoutFactor && (
                  <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                    <p className="text-xs text-violet-300"><RiStarLine className="mr-1 inline h-3 w-3" /> <strong>Standout:</strong> {r.standoutFactor}</p>
                  </div>
                )}
                {r.recruiterNote && <p className="mt-2 text-xs italic text-dark-400">💡 {r.recruiterNote}</p>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interview Plan + Insights */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {interviewPlan?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiEyeLine className="h-5 w-5 text-cyan-400" /> Interview Plan
              </h3>
              <div className="space-y-3">
                {interviewPlan.map((p, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-300 capitalize">{p.suggestedRound?.replace('-', ' ')}</span>
                    </div>
                    {p.focusAreas?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.focusAreas.map((f, j) => <span key={j} className="rounded-md bg-dark-800 px-1.5 py-0.5 text-[10px] text-dark-300">{f}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {hiringInsights?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiLightbulbLine className="h-5 w-5 text-amber-400" /> Hiring Insights
              </h3>
              <div className="space-y-2">
                {hiringInsights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/5">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">{i + 1}</span>
                    <span className="text-sm text-dark-300">{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShortlistResultsPage;
