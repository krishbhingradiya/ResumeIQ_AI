import { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import {
  RiDashboardLine, RiSearchLine, RiFilterLine, RiSortAsc, RiSortDesc,
  RiTrophyLine, RiUserLine, RiCheckboxCircleLine, RiCloseCircleLine,
  RiArrowLeftLine, RiDownload2Line, RiStarLine, RiStarFill,
  RiBarChartBoxLine, RiScales3Line, RiSparklingFill
} from 'react-icons/ri';
import jsPDF from 'jspdf';

const SKILL_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

const RecruiterDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const comparison = location.state?.comparison;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortDir, setSortDir] = useState('asc');
  const [skillFilter, setSkillFilter] = useState('');
  const [shortlisted, setShortlisted] = useState(new Set());

  if (!comparison || !comparison.resumes) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <RiDashboardLine className="mb-4 h-12 w-12 text-dark-600" />
        <h2 className="mb-3 font-display text-2xl font-bold text-white">No Candidate Data</h2>
        <p className="mb-6 text-dark-400">Compare resumes first, then access the recruiter dashboard.</p>
        <Link to="/compare" className="btn-gradient !rounded-2xl">
          <RiScales3Line className="h-5 w-5" /> Compare Resumes
        </Link>
      </motion.div>
    );
  }

  const { resumes, winnerReason, overallVerdict, keyDifferences = [] } = comparison;

  // Extract all unique skills
  const allSkills = useMemo(() => {
    const skills = new Set();
    resumes.forEach(r => {
      (r.extractedFacts?.technicalSkills || []).forEach(s => skills.add(s));
    });
    return [...skills].sort();
  }, [resumes]);

  // Filter & Sort
  const filtered = useMemo(() => {
    let list = [...resumes];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => r.fileName.toLowerCase().includes(q) ||
        (r.extractedFacts?.technicalSkills || []).some(s => s.toLowerCase().includes(q)));
    }
    if (skillFilter) {
      list = list.filter(r => (r.extractedFacts?.technicalSkills || [])
        .some(s => s.toLowerCase().includes(skillFilter.toLowerCase())));
    }
    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'rank') diff = (a.rank || 0) - (b.rank || 0);
      else if (sortBy === 'score') diff = (b.atsScore || 0) - (a.atsScore || 0);
      else if (sortBy === 'name') diff = a.fileName.localeCompare(b.fileName);
      return sortDir === 'desc' ? -diff : diff;
    });
    return list;
  }, [resumes, searchTerm, skillFilter, sortBy, sortDir]);

  const toggleShortlist = (idx) => {
    setShortlisted(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };

  // Stats
  const avgScore = Math.round(resumes.reduce((s, r) => s + r.atsScore, 0) / resumes.length);
  const topCandidate = resumes.find(r => r.rank === 1);

  // Score distribution data for bar chart
  const scoreBarData = resumes.map(r => ({
    name: r.fileName.length > 15 ? r.fileName.substring(0, 15) + '…' : r.fileName,
    score: r.atsScore,
    fill: r.rank === 1 ? '#fbbf24' : r.rank === 2 ? '#94a3b8' : '#6366f1'
  }));

  // Export PDF report
  const exportReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('ResumeIQ AI — Recruiter Report', 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 33);
    doc.setDrawColor(99, 102, 241);
    doc.line(20, 36, 190, 36);

    // Stats
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Summary', 20, 46);
    doc.setFontSize(10);
    doc.text(`Candidates Analyzed: ${resumes.length}`, 20, 54);
    doc.text(`Average ATS Score: ${avgScore}/100`, 20, 60);
    doc.text(`Top Candidate: ${topCandidate?.fileName || 'N/A'} (Score: ${topCandidate?.atsScore})`, 20, 66);
    doc.text(`Verdict: ${overallVerdict || ''}`, 20, 72, { maxWidth: 170 });

    // Candidate table
    let y = 86;
    doc.setFontSize(14);
    doc.text('Candidate Ranking', 20, y);
    y += 10;
    doc.setFontSize(9);

    resumes.sort((a, b) => (a.rank || 0) - (b.rank || 0)).forEach((r) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(99, 102, 241);
      doc.text(`#${r.rank} — ${r.fileName}`, 20, y);
      doc.setTextColor(60);
      doc.text(`ATS Score: ${r.atsScore}/100 | Level: ${r.experienceLevel}`, 25, y + 6);
      const strengths = (r.topStrengths || []).join(', ');
      const weaknesses = (r.criticalWeaknesses || []).join(', ');
      doc.text(`Strengths: ${strengths}`, 25, y + 12, { maxWidth: 165 });
      doc.text(`Weaknesses: ${weaknesses}`, 25, y + 18, { maxWidth: 165 });
      if (r.whyItLost) doc.text(`Note: ${r.whyItLost}`, 25, y + 24, { maxWidth: 165 });
      y += r.whyItLost ? 32 : 26;
    });

    doc.save('ResumeIQ_Recruiter_Report.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/4 h-96 w-96 bg-primary-500" />
        <div className="gradient-orb right-1/4 bottom-1/3 h-80 w-80 bg-accent-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button onClick={() => navigate(-1)}
              className="mb-3 flex items-center gap-1.5 text-sm text-dark-400 transition-colors hover:text-white">
              <RiArrowLeftLine className="h-4 w-4" /> Back
            </button>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              <RiDashboardLine className="mr-2 inline h-7 w-7 text-primary-400" />
              Recruiter <span className="gradient-text">Dashboard</span>
            </h1>
          </div>
          <button onClick={exportReport} className="btn-gradient !rounded-xl !py-2.5 !text-sm">
            <RiDownload2Line className="h-4 w-4" /> Export PDF Report
          </button>
        </div>

        {/* ═══ STATS CARDS ═══ */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Candidates', value: resumes.length, icon: RiUserLine, color: 'from-primary-500 to-accent-500' },
            { label: 'Avg ATS Score', value: `${avgScore}/100`, icon: RiBarChartBoxLine, color: 'from-emerald-500 to-teal-500' },
            { label: 'Top Candidate', value: topCandidate?.fileName?.substring(0, 18) || 'N/A', icon: RiTrophyLine, color: 'from-amber-500 to-orange-500' },
            { label: 'Shortlisted', value: shortlisted.size, icon: RiStarFill, color: 'from-pink-500 to-rose-500' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}>
              <div className="glass-card p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500">{stat.label}</p>
                    <p className="font-display text-lg font-bold text-white truncate">{stat.value}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══ SCORE CHART ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mb-8">
          <div className="glass-card p-6">
            <h3 className="mb-4 font-display text-base font-semibold text-white">📊 Candidate Score Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreBarData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {scoreBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ═══ SEARCH & FILTER BAR ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-6">
          <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
              <input type="text" placeholder="Search candidates or skills..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-dark-200 placeholder-dark-600 focus:border-primary-500/50 focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-dark-300 focus:outline-none">
                <option value="">All Skills</option>
                {allSkills.slice(0, 30).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-dark-300 focus:outline-none">
                <option value="rank">Sort: Rank</option>
                <option value="score">Sort: Score</option>
                <option value="name">Sort: Name</option>
              </select>
              <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-dark-400 hover:text-white transition-colors">
                {sortDir === 'asc' ? <RiSortAsc className="h-4 w-4" /> : <RiSortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ═══ CANDIDATE CARDS ═══ */}
        <div className="space-y-4">
          {filtered.map((resume, idx) => {
            const isWinner = resume.rank === 1;
            const isStar = shortlisted.has(resume.index);
            return (
              <motion.div key={resume.index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.05 }}>
                <div className={`glass-card p-5 sm:p-6 ${isWinner ? 'border-amber-500/20' : ''}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Rank Badge */}
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-black ${
                      resume.rank === 1 ? 'bg-amber-500/20 text-amber-300' :
                      resume.rank === 2 ? 'bg-slate-500/20 text-slate-300' : 'bg-dark-800 text-dark-400'
                    }`}>
                      #{resume.rank}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display text-base font-bold text-white truncate">{resume.fileName}</h4>
                        <button onClick={() => toggleShortlist(resume.index)}
                          className={`transition-colors ${isStar ? 'text-amber-400' : 'text-dark-600 hover:text-amber-400'}`}>
                          {isStar ? <RiStarFill className="h-5 w-5" /> : <RiStarLine className="h-5 w-5" />}
                        </button>
                        {isWinner && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">👑 WINNER</span>}
                      </div>
                      <p className="text-xs text-dark-500 mb-3">
                        {resume.experienceLevel} • Score: {resume.atsScore}/100
                        {resume.extractedFacts?.education && ` • ${resume.extractedFacts.education}`}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(resume.extractedFacts?.technicalSkills || []).slice(0, 8).map((s, i) => (
                          <span key={i} className="rounded-full bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 text-[10px] text-primary-300">{s}</span>
                        ))}
                        {(resume.extractedFacts?.technicalSkills || []).length > 8 &&
                          <span className="text-[10px] text-dark-600">+{(resume.extractedFacts?.technicalSkills || []).length - 8} more</span>
                        }
                      </div>

                      {/* Strengths/Weaknesses */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="text-xs">
                          <p className="text-emerald-400 font-medium mb-1">✅ Strengths</p>
                          {(resume.topStrengths || []).slice(0, 2).map((s, i) => (
                            <p key={i} className="text-dark-400 truncate">• {s}</p>
                          ))}
                        </div>
                        <div className="text-xs">
                          <p className="text-red-400 font-medium mb-1">⚠️ Weaknesses</p>
                          {(resume.criticalWeaknesses || []).slice(0, 2).map((w, i) => (
                            <p key={i} className="text-dark-400 truncate">• {w}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-center sm:text-right">
                      <p className={`text-3xl font-black ${isWinner ? 'text-amber-300' : 'text-dark-200'}`}>
                        {resume.atsScore}
                      </p>
                      <p className="text-[10px] text-dark-600 uppercase">ATS Score</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 text-center text-dark-600">No candidates match your search or filter.</div>
        )}

        {/* Bottom actions */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/compare" className="btn-gradient !rounded-2xl">
            <RiScales3Line className="h-5 w-5" /> Compare New Batch
          </Link>
          <button onClick={exportReport} className="btn-outline !rounded-2xl">
            <RiDownload2Line className="h-5 w-5" /> Download Report
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecruiterDashboard;
