import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiBarChartBoxLine, RiCodeSSlashLine, RiHeartLine, RiThumbUpLine,
  RiAlertLine, RiAddLine, RiLightbulbLine, RiBriefcaseLine,
  RiArrowLeftLine, RiUploadCloud2Line, RiSparklingFill, RiDownload2Line,
  RiMicLine, RiFileEditLine
} from 'react-icons/ri';
import jsPDF from 'jspdf';
import ScoreCircle from '../components/ScoreCircle';
import AnalysisCard, { SkillBadge, ListItem } from '../components/AnalysisCard';
import CareerChat from '../components/CareerChat';

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;
  const targetRole = results?.targetRole || location.state?.targetRole || null;

  // Scroll to top when results load so user sees the score first
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Empty state if no results
  if (!results) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-500/10">
          <RiBarChartBoxLine className="h-10 w-10 text-primary-400" />
        </div>
        <h2 className="mb-3 font-display text-2xl font-bold text-white">No Analysis Data</h2>
        <p className="mb-8 max-w-md text-dark-400">Upload your resume first to see AI-powered analysis results here.</p>
        <Link to="/upload" className="btn-gradient !rounded-2xl">
          <RiUploadCloud2Line className="h-5 w-5" /> Upload Resume
        </Link>
      </motion.div>
    );
  }

  const {
    atsScore = 0,
    experienceLevel = '',
    scoringContext = '',
    scoreBreakdown = {},
    technicalSkills = [],
    softSkills = [],
    strengths = [],
    weaknesses = [],
    missingSkills = [],
    suggestions = [],
    recommendedRoles = [],
  } = results;

  const breakdownItems = [
    { label: 'Tech & Knowledge',             key: 'techKnowledge', max: 20, color: 'from-fuchsia-500 to-pink-500' },
    { label: 'Formatting & ATS Readability',  key: 'formatting',    max: 15, color: 'from-cyan-500 to-blue-500' },
    { label: 'Content Completeness',          key: 'completeness',  max: 15, color: 'from-emerald-500 to-teal-500' },
    { label: 'Keyword Density & Relevance',   key: 'keywords',      max: 20, color: 'from-violet-500 to-purple-500' },
    { label: 'Impact & Quantification',       key: 'impact',        max: 20, color: 'from-amber-500 to-orange-500' },
    { label: 'Language & Action Verbs',       key: 'language',      max: 5,  color: 'from-pink-500 to-rose-500' },
    { label: 'Grammar & Professionalism',     key: 'grammar',       max: 5,  color: 'from-primary-500 to-accent-500' },
  ];

  const exportReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text('ResumeIQ AI — Analysis Report', 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 33);
    
    if (targetRole) {
      doc.text(`Target Role: ${targetRole}`, 20, 39);
    }
    
    doc.setDrawColor(99, 102, 241);
    doc.line(20, 43, 190, 43);

    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(`ATS Score: ${atsScore}/100`, 20, 55);
    
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`Experience Level: ${experienceLevel}`, 20, 63);

    let y = 75;
    
    const addSection = (title, items) => {
      if (!items || items.length === 0) return;
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(title, 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(80);
      items.forEach(item => {
        if (y > 280) { doc.addPage(); y = 20; }
        const text = doc.splitTextToSize(`• ${item}`, 170);
        doc.text(text, 25, y);
        y += (text.length * 5) + 2;
      });
      y += 5;
    };

    addSection('Top Strengths', strengths);
    addSection('Critical Weaknesses', weaknesses);
    addSection('Missing Skills', missingSkills);
    addSection('Actionable Suggestions', suggestions);
    
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Score Breakdown', 20, y);
    y += 8;
    doc.setFontSize(10);
    breakdownItems.forEach(item => {
      const val = scoreBreakdown[item.key] || 0;
      doc.text(`${item.label}: ${val}/${item.max}`, 25, y);
      y += 6;
    });

    doc.save('ResumeIQ_Analysis_Report.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-24 pb-20 sm:pt-32">
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
            <button onClick={() => navigate('/upload')} className="mb-3 flex items-center gap-1.5 text-sm text-dark-400 transition-colors hover:text-white">
              <RiArrowLeftLine className="h-4 w-4" /> Back to Upload
            </button>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              <RiSparklingFill className="mr-2 inline h-7 w-7 text-primary-400" />
              Analysis <span className="gradient-text">Dashboard</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={exportReport} className="btn-outline !rounded-xl !py-2.5 !text-sm">
              <RiDownload2Line className="h-4 w-4" /> Export PDF
            </button>
            <Link to="/mock-interview" className="btn-outline !rounded-xl !py-2.5 !text-sm text-violet-400 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10">
              <RiMicLine className="h-4 w-4" /> Mock Interview
            </Link>
            <Link to="/upload" className="btn-gradient !rounded-xl !py-2.5 !text-sm">
              <RiUploadCloud2Line className="h-4 w-4" /> Analyze Another
            </Link>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-xl" />
            <div className="glass-card relative p-8 text-center sm:p-10">
              <h2 className="mb-4 font-display text-xl font-semibold text-white">ATS Compatibility Score</h2>
              {/* Target role badge */}
              {targetRole && (
                <div className="mb-3 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-primary-500/20 border border-violet-500/30 px-4 py-1.5 text-xs font-semibold text-violet-200">
                    🎯 Analyzed for: <span className="ml-1 text-white">{targetRole}</span>
                  </span>
                </div>
              )}
              {/* Experience level badge */}
              {experienceLevel && experienceLevel !== 'unknown' && (
                <div className="mb-5 flex items-center justify-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    experienceLevel === 'student' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                    experienceLevel === 'fresher' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    experienceLevel === 'junior'  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    experienceLevel === 'mid'     ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {experienceLevel === 'student' ? '🎓 Student' :
                     experienceLevel === 'fresher' ? '🌱 Fresher' :
                     experienceLevel === 'junior'  ? '💼 Junior' :
                     experienceLevel === 'mid'     ? '⚡ Mid-Level' : '🏆 Senior'} Level Detected
                  </span>
                </div>
              )}
              <ScoreCircle score={atsScore} />
              <p className="mt-4 text-sm text-dark-400">
                {atsScore >= 80 ? 'Your resume is well-optimized for ATS systems!' :
                 atsScore >= 60 ? "Good foundation, but there's room for improvement." :
                 'Your resume needs significant optimization for ATS systems.'}
              </p>
              {scoringContext && (
                <p className="mt-2 text-xs text-dark-500 italic">{scoringContext}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        {Object.keys(scoreBreakdown).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
            <div className="glass-card p-6 sm:p-8">
              <h3 className="mb-6 font-display text-base font-semibold text-white">Score Breakdown — Universal ATS Rubric</h3>
              <div className="space-y-4">
                {breakdownItems.map(({ label, key, max, color }) => {
                  const val = scoreBreakdown[key] ?? 0;
                  const pct = Math.round((val / max) * 100);
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm text-dark-300">{label}</span>
                        <span className="text-sm font-semibold text-white">{val}<span className="text-dark-500">/{max}</span></span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-dark-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                          className={`h-full rounded-full bg-gradient-to-r ${color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <AnalysisCard title="Technical Skills" icon={RiCodeSSlashLine} gradient="from-blue-500 to-cyan-500" delay={0.2}>
            <div className="flex flex-wrap gap-2">
              {technicalSkills.length > 0 ? technicalSkills.map((s, i) => <SkillBadge key={i} skill={s} variant="blue" />) : <p className="text-sm text-dark-500">No technical skills detected</p>}
            </div>
          </AnalysisCard>

          <AnalysisCard title="Soft Skills" icon={RiHeartLine} gradient="from-pink-500 to-rose-500" delay={0.3}>
            <div className="flex flex-wrap gap-2">
              {softSkills.length > 0 ? softSkills.map((s, i) => <SkillBadge key={i} skill={s} variant="purple" />) : <p className="text-sm text-dark-500">No soft skills detected</p>}
            </div>
          </AnalysisCard>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <AnalysisCard title="Strengths" icon={RiThumbUpLine} gradient="from-emerald-500 to-teal-500" delay={0.4}>
            <div className="space-y-2">
              {strengths.length > 0 ? strengths.map((s, i) => <ListItem key={i} text={s} icon={RiThumbUpLine} color="text-emerald-400" />) : <p className="text-sm text-dark-500">No strengths identified</p>}
            </div>
          </AnalysisCard>

          <AnalysisCard title="Weaknesses" icon={RiAlertLine} gradient="from-amber-500 to-orange-500" delay={0.5}>
            <div className="space-y-2">
              {weaknesses.length > 0 ? weaknesses.map((s, i) => <ListItem key={i} text={s} icon={RiAlertLine} color="text-amber-400" />) : <p className="text-sm text-dark-500">No weaknesses found</p>}
            </div>
          </AnalysisCard>
        </div>

        {/* Missing Skills & Suggestions */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <AnalysisCard title="Missing Skills" icon={RiAddLine} gradient="from-red-500 to-rose-500" delay={0.6}>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? missingSkills.map((s, i) => <SkillBadge key={i} skill={s} variant="danger" />) : <p className="text-sm text-dark-500">No missing skills identified</p>}
            </div>
          </AnalysisCard>

          <AnalysisCard title="Improvement Suggestions" icon={RiLightbulbLine} gradient="from-accent-500 to-purple-500" delay={0.7}>
            <div className="space-y-2">
              {suggestions.length > 0 ? suggestions.map((s, i) => <ListItem key={i} text={s} icon={RiLightbulbLine} color="text-accent-400" />) : <p className="text-sm text-dark-500">No suggestions available</p>}
            </div>
          </AnalysisCard>
        </div>

        {/* Recommended Roles */}
        <AnalysisCard title="Recommended Job Roles" icon={RiBriefcaseLine} gradient="from-primary-500 to-accent-500" delay={0.8}>
          <div className="flex flex-wrap gap-2">
            {recommendedRoles.length > 0 ? recommendedRoles.map((r, i) => <SkillBadge key={i} skill={r} variant="success" />) : <p className="text-sm text-dark-500">No role recommendations available</p>}
          </div>
        </AnalysisCard>
      </div>

      {/* AI Career Chat — Floating */}
      <CareerChat analysisContext={results} />
    </motion.div>
  );
};

export default DashboardPage;
