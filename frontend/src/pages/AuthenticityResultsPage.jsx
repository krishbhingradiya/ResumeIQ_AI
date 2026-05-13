import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiShieldCheckLine, RiShieldLine, RiAlertLine, RiErrorWarningLine,
  RiCheckboxCircleLine, RiArrowLeftLine, RiUploadCloud2Line,
  RiRobotLine, RiSpyLine, RiEyeLine, RiFileWarningLine
} from 'react-icons/ri';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const AuthenticityResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;
  const fileName = location.state?.fileName || 'Resume';

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  if (!results) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <RiShieldLine className="mb-4 h-16 w-16 text-red-400" />
        <h2 className="mb-3 font-display text-2xl font-bold text-white">No Authenticity Data</h2>
        <p className="mb-8 text-dark-400">Upload a resume to scan for authenticity.</p>
        <Link to="/authenticity" className="btn-gradient !rounded-2xl"><RiUploadCloud2Line className="h-5 w-5" /> Scan Resume</Link>
      </motion.div>
    );
  }

  const { authenticityScore, aiGeneratedProbability, riskLevel, trustworthinessGrade, overallVerdict, categories, redFlags, aiPatterns, genuineIndicators, recruiterAdvice } = results;

  const riskColors = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' };
  const riskBg = { low: 'bg-emerald-500/10 border-emerald-500/30', medium: 'bg-amber-500/10 border-amber-500/30', high: 'bg-orange-500/10 border-orange-500/30', critical: 'bg-red-500/10 border-red-500/30' };
  const statusIcons = { pass: <RiCheckboxCircleLine className="h-5 w-5 text-emerald-400" />, warning: <RiAlertLine className="h-5 w-5 text-amber-400" />, fail: <RiErrorWarningLine className="h-5 w-5 text-red-400" /> };
  const statusBg = { pass: 'border-emerald-500/20 bg-emerald-500/5', warning: 'border-amber-500/20 bg-amber-500/5', fail: 'border-red-500/20 bg-red-500/5' };

  const radarData = Object.entries(categories).map(([key, val]) => ({
    category: key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim(),
    score: val.score,
    fullMark: 100,
  }));

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedFlags = [...(redFlags || [])].sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/3 h-96 w-96 bg-red-500" />
        <div className="gradient-orb right-1/4 bottom-1/3 h-80 w-80 bg-amber-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button onClick={() => navigate('/authenticity')} className="mb-3 flex items-center gap-1.5 text-sm text-dark-400 hover:text-white">
              <RiArrowLeftLine className="h-4 w-4" /> Back
            </button>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              <RiShieldCheckLine className="mr-2 inline h-7 w-7 text-red-400" />
              Authenticity <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">Report</span>
            </h1>
            <p className="mt-1 text-sm text-dark-500">{fileName}</p>
          </div>
          <Link to="/authenticity" className="btn-gradient !rounded-xl !py-2.5 !text-sm" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
            <RiUploadCloud2Line className="h-4 w-4" /> Scan Another
          </Link>
        </div>

        {/* Score Cards Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Authenticity Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">Authenticity Score</p>
            <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
              <svg className="-rotate-90" width="96" height="96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke={authenticityScore >= 70 ? '#34d399' : authenticityScore >= 40 ? '#fbbf24' : '#f87171'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (authenticityScore / 100) * 251.2 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <span className={`absolute text-2xl font-bold ${authenticityScore >= 70 ? 'text-emerald-400' : authenticityScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{authenticityScore}</span>
            </div>
            <p className="text-xs text-dark-400">{authenticityScore >= 70 ? 'Appears Authentic' : authenticityScore >= 40 ? 'Some Concerns' : 'High Risk'}</p>
          </motion.div>

          {/* AI Generated Probability */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">AI Generated Probability</p>
            <div className="mb-3 flex items-center justify-center">
              <RiRobotLine className={`h-12 w-12 ${aiGeneratedProbability > 60 ? 'text-red-400' : aiGeneratedProbability > 30 ? 'text-amber-400' : 'text-emerald-400'}`} />
            </div>
            <p className={`text-3xl font-bold ${aiGeneratedProbability > 60 ? 'text-red-400' : aiGeneratedProbability > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{aiGeneratedProbability}%</p>
            <p className="mt-1 text-xs text-dark-400">{aiGeneratedProbability > 60 ? 'Likely AI-Written' : aiGeneratedProbability > 30 ? 'Partially AI-Assisted' : 'Likely Human-Written'}</p>
          </motion.div>

          {/* Risk Level */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">Risk Level</p>
            <div className="mb-3 flex items-center justify-center">
              <RiShieldLine className={`h-12 w-12 ${riskColors[riskLevel]}`} />
            </div>
            <span className={`inline-block rounded-full border px-4 py-1.5 text-sm font-bold uppercase ${riskBg[riskLevel]} ${riskColors[riskLevel]}`}>
              {riskLevel}
            </span>
          </motion.div>

          {/* Trust Grade */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">Trust Grade</p>
            <p className={`text-5xl font-black ${trustworthinessGrade?.startsWith('A') ? 'text-emerald-400' : trustworthinessGrade?.startsWith('B') ? 'text-blue-400' : trustworthinessGrade?.startsWith('C') ? 'text-amber-400' : 'text-red-400'}`}>
              {trustworthinessGrade}
            </p>
            <p className="mt-2 text-xs text-dark-400">Trustworthiness Rating</p>
          </motion.div>
        </div>

        {/* Verdict Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className={`glass-card rounded-2xl border p-6 ${riskBg[riskLevel]}`}>
            <div className="flex items-start gap-4">
              <RiEyeLine className={`mt-0.5 h-6 w-6 flex-shrink-0 ${riskColors[riskLevel]}`} />
              <div>
                <h3 className="mb-1 font-display text-lg font-semibold text-white">Overall Verdict</h3>
                <p className="text-sm text-dark-300">{overallVerdict}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Radar Chart + Category Breakdown */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
            <h3 className="mb-4 font-display text-base font-semibold text-white">Authenticity Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="mb-4 font-display text-base font-semibold text-white">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(categories).map(([key, val]) => (
                <div key={key} className={`rounded-xl border p-4 ${statusBg[val.status]}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusIcons[val.status]}
                      <span className="text-sm font-medium text-white">{key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()}</span>
                    </div>
                    <span className={`text-sm font-bold ${val.score >= 70 ? 'text-emerald-400' : val.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{val.score}/100</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-dark-800">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${val.score}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${val.score >= 70 ? 'bg-emerald-500' : val.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  </div>
                  {val.findings?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {val.findings.map((f, i) => <li key={i} className="text-xs text-dark-400">• {f}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Red Flags */}
        {sortedFlags.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-8">
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiFileWarningLine className="h-5 w-5 text-red-400" /> Red Flags Detected ({sortedFlags.length})
              </h3>
              <div className="space-y-3">
                {sortedFlags.map((flag, i) => {
                  const sevColor = { critical: 'border-red-500/40 bg-red-500/10', high: 'border-orange-500/30 bg-orange-500/10', medium: 'border-amber-500/20 bg-amber-500/5', low: 'border-blue-500/20 bg-blue-500/5' };
                  const sevText = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-blue-400' };
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${sevColor[flag.severity] || sevColor.low}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{flag.title}</h4>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${sevText[flag.severity] || sevText.low} bg-dark-900/50`}>{flag.severity}</span>
                      </div>
                      <p className="mb-2 text-xs text-dark-300">{flag.description}</p>
                      {flag.evidence && (
                        <div className="mb-2 rounded-lg bg-dark-900/50 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-dark-500">Evidence</p>
                          <p className="text-xs italic text-dark-400">"{flag.evidence}"</p>
                        </div>
                      )}
                      {flag.recommendation && <p className="text-xs text-dark-400">💡 <span className="text-dark-300">{flag.recommendation}</span></p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Patterns + Genuine Indicators */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {aiPatterns?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiRobotLine className="h-5 w-5 text-violet-400" /> AI Writing Patterns
              </h3>
              <div className="space-y-3">
                {aiPatterns.map((p, i) => (
                  <div key={i} className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-violet-300">{p.pattern}</span>
                      <span className={`text-xs font-bold ${p.confidence > 70 ? 'text-red-400' : 'text-amber-400'}`}>{p.confidence}%</span>
                    </div>
                    {p.example && <p className="text-xs italic text-dark-400">"{p.example}"</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {genuineIndicators?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiCheckboxCircleLine className="h-5 w-5 text-emerald-400" /> Genuine Indicators
              </h3>
              <div className="space-y-2">
                {genuineIndicators.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <RiCheckboxCircleLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span className="text-sm text-dark-300">{g}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Recruiter Advice */}
        {recruiterAdvice?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-8">
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiSpyLine className="h-5 w-5 text-primary-400" /> Recruiter Recommendations
              </h3>
              <div className="space-y-2">
                {recruiterAdvice.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/5">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-[10px] font-bold text-primary-400">{i + 1}</span>
                    <span className="text-sm text-dark-300">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AuthenticityResultsPage;
