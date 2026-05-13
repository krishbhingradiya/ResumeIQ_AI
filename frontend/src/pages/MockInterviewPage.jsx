import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  RiMicLine, RiUploadCloud2Line, RiCodeSSlashLine, RiTeamLine,
  RiFolderLine, RiHeartLine, RiSparklingFill, RiArrowRightLine,
  RiCheckLine, RiDeleteBinLine, RiEyeLine, RiEyeOffLine, RiLightbulbLine
} from 'react-icons/ri';
import { getMockInterview } from '../services/api';

const CATEGORY_ICONS = { code: RiCodeSSlashLine, users: RiTeamLine, folder: RiFolderLine, heart: RiHeartLine };
const CATEGORY_COLORS = {
  code: 'from-blue-500 to-cyan-500', users: 'from-violet-500 to-purple-500',
  folder: 'from-emerald-500 to-teal-500', heart: 'from-pink-500 to-rose-500'
};
const DIFF_COLORS = { easy: 'bg-emerald-500/20 text-emerald-400', medium: 'bg-amber-500/20 text-amber-400', hard: 'bg-red-500/20 text-red-400' };

const STEPS = [
  { icon: '📄', label: 'Reading Resume' },
  { icon: '🧠', label: 'Analyzing Skills & Projects' },
  { icon: '🎤', label: 'Generating Interview Questions' },
  { icon: '✨', label: 'Preparing Tips & Answers' },
];

const MockInterviewPage = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      const f = accepted[0];
      if (f.type !== 'application/pdf') { toast.error('PDF only'); return; }
      setFile(f);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, multiple: false
  });

  const handleGenerate = async () => {
    if (!file) { toast.error('Upload a resume first'); return; }
    setIsLoading(true);
    setCurrentStep(0);
    const interval = setInterval(() => setCurrentStep(p => p < STEPS.length - 1 ? p + 1 : p), 3500);
    try {
      const data = await getMockInterview(file, targetRole);
      clearInterval(interval);
      setResult(data.result);
      toast.success('Mock interview ready!');
    } catch (err) {
      clearInterval(interval);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (key) => {
    setRevealedAnswers(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/3 h-96 w-96 bg-violet-500" />
        <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-primary-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
            <RiMicLine className="h-8 w-8 text-violet-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            AI Mock <span className="gradient-text">Interview</span>
          </h1>
          <p className="mt-3 text-dark-400">Get personalized interview questions based on your resume</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-auto max-w-lg">
              <div className="glass-card p-8 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10">
                  <RiSparklingFill className="h-8 w-8 text-violet-400" />
                </motion.div>
                <h3 className="mb-6 font-display text-xl font-bold text-white">Generating Interview...</h3>
                <div className="space-y-3">
                  {STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl p-3 text-left text-sm transition-all ${
                      i === currentStep ? 'bg-violet-500/10 border border-violet-500/20' :
                      i < currentStep ? 'bg-white/5 opacity-70' : 'opacity-30'
                    }`}>
                      <span className="text-lg">{i < currentStep ? '✅' : step.icon}</span>
                      <span className={i <= currentStep ? 'text-white' : 'text-dark-600'}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mx-auto max-w-xl">
              <div className="glass-card p-6">
                <h3 className="mb-4 font-display text-base font-semibold text-white">Upload Resume</h3>
                {!file ? (
                  <div {...getRootProps()}
                    className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
                      isDragActive ? 'border-violet-500 bg-violet-500/5' : 'border-white/10 hover:border-primary-500/50'
                    }`}>
                    <input {...getInputProps()} />
                    <RiUploadCloud2Line className="mb-3 h-10 w-10 text-dark-500" />
                    <p className="text-sm text-dark-300">Drag & drop resume PDF</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
                    <RiCheckLine className="h-5 w-5 text-emerald-400" />
                    <span className="flex-1 truncate text-sm text-white">{file.name}</span>
                    <button onClick={() => { setFile(null); setResult(null); }} className="text-dark-500 hover:text-red-400">
                      <RiDeleteBinLine className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <input type="text" placeholder="Target role (optional, e.g., Frontend Developer)"
                  value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-dark-200 placeholder-dark-600 focus:border-primary-500/50 focus:outline-none" />

                <button onClick={handleGenerate} disabled={!file}
                  className="mt-5 w-full btn-gradient !rounded-xl disabled:opacity-40">
                  <RiSparklingFill className="h-5 w-5" /> Generate Mock Interview <RiArrowRightLine className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
                <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-xs font-medium text-violet-300">
                  🎯 {result.targetRole}
                </span>
                <span className="rounded-full bg-dark-800 border border-white/10 px-4 py-1.5 text-xs text-dark-300">
                  {result.totalQuestions} Questions
                </span>
                <span className={`rounded-full px-4 py-1.5 text-xs font-medium ${DIFF_COLORS[result.difficulty] || ''}`}>
                  {result.difficulty?.toUpperCase()} Level
                </span>
              </div>

              {/* Question Categories */}
              <div className="space-y-6">
                {(result.categories || []).map((cat, ci) => {
                  const IconComp = CATEGORY_ICONS[cat.icon] || RiCodeSSlashLine;
                  const gradient = CATEGORY_COLORS[cat.icon] || 'from-primary-500 to-accent-500';
                  return (
                    <motion.div key={ci} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.1 }}>
                      <div className="glass-card p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                            <IconComp className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-display text-base font-bold text-white">{cat.name}</h3>
                          <span className="rounded-full bg-dark-800 px-2 py-0.5 text-[10px] text-dark-400">{cat.questions?.length || 0} Q</span>
                        </div>

                        <div className="space-y-4">
                          {(cat.questions || []).map((q, qi) => {
                            const qKey = `${ci}-${qi}`;
                            const isRevealed = revealedAnswers.has(qKey);
                            return (
                              <div key={qi} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                                <div className="flex items-start gap-3">
                                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-[10px] font-bold text-primary-400">
                                    {qi + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-white mb-1">{q.question}</p>
                                    <p className="text-[10px] text-dark-600 mb-2">{q.context}</p>
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] ${DIFF_COLORS[q.difficulty] || ''}`}>
                                      {q.difficulty}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 flex gap-2">
                                  <button onClick={() => toggleAnswer(qKey)}
                                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-dark-400 hover:text-white transition-colors">
                                    {isRevealed ? <RiEyeOffLine className="h-3.5 w-3.5" /> : <RiEyeLine className="h-3.5 w-3.5" />}
                                    {isRevealed ? 'Hide Answer' : 'Show Expected Answer'}
                                  </button>
                                </div>

                                <AnimatePresence>
                                  {isRevealed && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                      <div className="mt-3 space-y-2">
                                        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                                          <p className="text-[10px] uppercase tracking-wider text-emerald-500 mb-1">Expected Answer Points</p>
                                          <p className="text-xs text-dark-300">{q.expectedAnswer}</p>
                                        </div>
                                        {q.tip && (
                                          <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                                            <RiLightbulbLine className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                                            <p className="text-xs text-dark-300">{q.tip}</p>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Preparation Tips */}
              {result.preparationTips?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="mt-8">
                  <div className="glass-card p-6">
                    <h3 className="mb-4 font-display text-base font-semibold text-white">💡 General Preparation Tips</h3>
                    <div className="space-y-2">
                      {result.preparationTips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-dark-300">
                          <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-400" />{tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-8 text-center">
                <button onClick={() => { setResult(null); setRevealedAnswers(new Set()); }}
                  className="btn-outline !rounded-2xl">
                  <RiMicLine className="h-5 w-5" /> Generate New Interview
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MockInterviewPage;
