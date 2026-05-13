import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiRoadMapLine, RiArrowLeftLine, RiUploadCloud2Line, RiCheckboxCircleLine,
  RiBookOpenLine, RiCodeBoxLine, RiTrophyLine, RiTimeLine,
  RiStarLine, RiRocketLine, RiAwardLine, RiLightbulbLine, RiCalendarLine
} from 'react-icons/ri';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const RoadmapResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  if (!results) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <RiRoadMapLine className="mb-4 h-16 w-16 text-teal-400" />
        <h2 className="mb-3 font-display text-2xl font-bold text-white">No Roadmap Data</h2>
        <p className="mb-8 text-dark-400">Upload a resume to generate a career roadmap.</p>
        <Link to="/roadmap" className="btn-gradient !rounded-2xl" style={{ background: 'linear-gradient(135deg, #14b8a6, #06b6d4)' }}>
          <RiUploadCloud2Line className="h-5 w-5" /> Generate Roadmap
        </Link>
      </motion.div>
    );
  }

  const { targetRole, currentLevel, jobReadinessScore, estimatedWeeks, currentSkills, missingSkills, roadmapPhases, certifications, portfolioProjects, weeklyPlan, careerGrowth, tips } = results;

  const readinessData = [{ name: 'Readiness', value: jobReadinessScore, fill: jobReadinessScore >= 70 ? '#34d399' : jobReadinessScore >= 40 ? '#fbbf24' : '#f87171' }];

  const priorityColors = { critical: 'border-red-500/30 bg-red-500/10 text-red-300', high: 'border-orange-500/30 bg-orange-500/10 text-orange-300', medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300', low: 'border-blue-500/30 bg-blue-500/10 text-blue-300' };
  const phaseColors = ['from-teal-500 to-cyan-500', 'from-blue-500 to-violet-500', 'from-violet-500 to-purple-500', 'from-pink-500 to-rose-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/3 h-96 w-96 bg-teal-500" />
        <div className="gradient-orb right-1/4 bottom-1/3 h-80 w-80 bg-cyan-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button onClick={() => navigate('/roadmap')} className="mb-3 flex items-center gap-1.5 text-sm text-dark-400 hover:text-white">
              <RiArrowLeftLine className="h-4 w-4" /> Back
            </button>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              <RiRoadMapLine className="mr-2 inline h-7 w-7 text-teal-400" />
              Career <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Roadmap</span>
            </h1>
            <p className="mt-1 text-sm text-dark-500">Personalized path to become a {targetRole}</p>
          </div>
          <Link to="/roadmap" className="btn-gradient !rounded-xl !py-2.5 !text-sm" style={{ background: 'linear-gradient(135deg, #14b8a6, #06b6d4)' }}>
            <RiUploadCloud2Line className="h-4 w-4" /> New Roadmap
          </Link>
        </div>

        {/* Top Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-dark-500">Target Role</p>
            <p className="text-lg font-bold text-teal-400">{targetRole}</p>
            <p className="mt-1 text-xs text-dark-400 capitalize">{currentLevel} Level</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">Job Readiness</p>
            <ResponsiveContainer width="100%" height={80}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={readinessData} startAngle={180} endAngle={0}>
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className={`-mt-2 text-2xl font-bold ${jobReadinessScore >= 70 ? 'text-emerald-400' : jobReadinessScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{jobReadinessScore}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">Estimated Time</p>
            <RiCalendarLine className="mx-auto mb-1 h-8 w-8 text-cyan-400" />
            <p className="text-2xl font-bold text-white">{estimatedWeeks}</p>
            <p className="text-xs text-dark-400">weeks to job-ready</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">Skills to Learn</p>
            <RiStarLine className="mx-auto mb-1 h-8 w-8 text-amber-400" />
            <p className="text-2xl font-bold text-white">{missingSkills?.length || 0}</p>
            <p className="text-xs text-dark-400">missing skills identified</p>
          </motion.div>
        </div>

        {/* Missing Skills */}
        {missingSkills?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiStarLine className="h-5 w-5 text-amber-400" /> Missing Skills ({missingSkills.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {missingSkills.map((s, i) => (
                  <div key={i} className={`rounded-xl border p-3 ${priorityColors[s.priority] || priorityColors.medium}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{s.skill}</span>
                      <span className="rounded-full bg-dark-900/50 px-2 py-0.5 text-[10px] font-bold uppercase">{s.priority}</span>
                    </div>
                    <p className="text-xs text-dark-400">{s.currentLevel} → {s.targetLevel}</p>
                    {s.reason && <p className="mt-1 text-xs text-dark-500">{s.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Roadmap Timeline */}
        {roadmapPhases?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
            <h3 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-white">
              <RiTimeLine className="h-5 w-5 text-teal-400" /> Learning Roadmap
            </h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-violet-500 to-pink-500 sm:left-8" />

              <div className="space-y-6">
                {roadmapPhases.map((phase, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="relative pl-14 sm:pl-20">
                    {/* Timeline dot */}
                    <div className={`absolute left-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${phaseColors[i % phaseColors.length]} shadow-lg sm:left-6`}>
                      <span className="text-[10px] font-bold text-white">{phase.phase}</span>
                    </div>

                    <div className="glass-card-hover rounded-2xl p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-white">{phase.title}</h4>
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-dark-300">{phase.duration}</span>
                      </div>
                      <p className="mb-3 text-xs text-teal-300">{phase.focus}</p>

                      {/* Skills tags */}
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {phase.skills?.map((s, j) => (
                          <span key={j} className="rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-300 border border-teal-500/20">{s}</span>
                        ))}
                      </div>

                      {/* Tasks */}
                      {phase.tasks?.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {phase.tasks.map((t, j) => (
                            <div key={j} className="flex items-start gap-2 rounded-lg bg-white/[0.03] p-2.5">
                              <RiCheckboxCircleLine className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal-400" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-dark-200">{t.task}</p>
                                <p className="text-[10px] text-dark-500">{t.resource} • ~{t.estimatedHours}h</p>
                              </div>
                              <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase ${t.priority === 'must-do' ? 'bg-red-500/20 text-red-300' : t.priority === 'bonus' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{t.priority}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Milestone */}
                      {phase.milestone && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">🎯 Milestone</p>
                          <p className="text-xs text-emerald-300">{phase.milestone}</p>
                        </div>
                      )}

                      {/* Project */}
                      {phase.project && (
                        <div className="mt-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-violet-400">🛠️ Hands-on Project</p>
                          <p className="text-xs font-medium text-white">{phase.project.title}</p>
                          <p className="text-[10px] text-dark-400">{phase.project.description}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom row: Certifications + Portfolio Projects */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {certifications?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiAwardLine className="h-5 w-5 text-amber-400" /> Recommended Certifications
              </h3>
              <div className="space-y-3">
                {certifications.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <RiAwardLine className={`mt-0.5 h-5 w-5 flex-shrink-0 ${c.priority === 'essential' ? 'text-amber-400' : c.priority === 'recommended' ? 'text-blue-400' : 'text-dark-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-dark-400">{c.provider} • {c.estimatedCost} • {c.timeToComplete}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {portfolioProjects?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiCodeBoxLine className="h-5 w-5 text-violet-400" /> Portfolio Projects
              </h3>
              <div className="space-y-3">
                {portfolioProjects.map((p, i) => (
                  <div key={i} className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{p.title}</p>
                      <span className="rounded-full bg-dark-800 px-2 py-0.5 text-[10px] text-dark-400 capitalize">{p.difficulty}</span>
                    </div>
                    <p className="mb-2 text-xs text-dark-400">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.techStack?.map((t, j) => <span key={j} className="rounded-md bg-dark-800 px-1.5 py-0.5 text-[10px] text-dark-300">{t}</span>)}
                    </div>
                    {p.impactOnResume && <p className="mt-2 text-[10px] text-teal-400">💡 {p.impactOnResume}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Career Growth */}
        {careerGrowth && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-8">
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                <RiRocketLine className="h-5 w-5 text-pink-400" /> Career Growth Trajectory
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: '3 Months', value: careerGrowth.shortTerm, icon: '🌱', color: 'border-emerald-500/20 bg-emerald-500/5' },
                  { label: '6 Months', value: careerGrowth.midTerm, icon: '🌿', color: 'border-teal-500/20 bg-teal-500/5' },
                  { label: '1 Year', value: careerGrowth.longTerm, icon: '🌳', color: 'border-blue-500/20 bg-blue-500/5' },
                  { label: 'Salary Range', value: careerGrowth.salaryRange, icon: '💰', color: 'border-amber-500/20 bg-amber-500/5' },
                ].map((g, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${g.color}`}>
                    <p className="mb-1 text-lg">{g.icon}</p>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-dark-500">{g.label}</p>
                    <p className="text-sm text-dark-200">{g.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        {tips?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="glass-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
              <RiLightbulbLine className="h-5 w-5 text-amber-400" /> Pro Tips
            </h3>
            <div className="space-y-2">
              {tips.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:bg-white/5">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">{i + 1}</span>
                  <span className="text-sm text-dark-300">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RoadmapResultsPage;
