import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiRoadMapLine, RiUploadCloud2Line, RiFileTextLine, RiCloseLine, RiSparklingFill, RiArrowRightLine, RiBriefcaseLine, RiSearchLine } from 'react-icons/ri';
import { getRoadmap } from '../services/api';
import { validatePDF, formatFileSize } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ROLE_SUGGESTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist',
  'Machine Learning Engineer', 'DevOps Engineer', 'Mobile App Developer', 'UI/UX Designer',
  'Product Manager', 'Cybersecurity Analyst', 'Cloud Engineer', 'Data Analyst',
  'AI/ML Researcher', 'Software Architect', 'QA Engineer', 'Business Analyst',
];

const RoadmapPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileSelect = (f) => {
    if (!f) return;
    const v = validatePDF(f);
    if (!v.valid) { toast.error(v.error); return; }
    setFile(f);
    toast.success(`"${f.name}" selected`);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  const filteredRoles = ROLE_SUGGESTIONS.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

  const onSubmit = async () => {
    if (!file || !targetRole) {
      toast.error('Please upload a resume and select a target role');
      return;
    }
    setAnalyzing(true);
    toast.loading('Generating your career roadmap...', { id: 'roadmap' });
    try {
      const data = await getRoadmap(file, targetRole);
      toast.success('Career roadmap generated!', { id: 'roadmap' });
      navigate('/roadmap-results', { state: { results: data.result, fileName: file.name } });
    } catch (err) {
      toast.error(err.message, { id: 'roadmap' });
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          <LoadingSpinner text={`Generating career roadmap for "${targetRole}"...`} />
          <p className="mt-4 text-center text-sm text-dark-400">AI is analyzing your skills and creating a personalized learning path...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-28 pb-20 sm:pt-36">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/3 top-1/4 h-96 w-96 bg-teal-500" />
        <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-cyan-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-2xl px-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-sm text-teal-300">
            <RiRoadMapLine className="mr-1.5 inline h-3.5 w-3.5" /> AI Career Coach
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Skill Gap <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Roadmap</span>
          </h1>
          <p className="mt-3 text-dark-400">Get a personalized learning roadmap to become job-ready for your dream role</p>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          {/* Upload area */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 blur-xl opacity-60" />
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`glass-card relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all sm:p-14 ${
                isDragging ? 'border-teal-400 bg-teal-500/10 scale-[1.02]' : file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-teal-500/30'
              }`}
              onClick={() => !file && document.getElementById('roadmapFileInput').click()}
            >
              <input id="roadmapFileInput" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} className="hidden" />
              {!file ? (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                    <RiRoadMapLine className="h-8 w-8 text-teal-400" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-white">{isDragging ? 'Drop it here!' : 'Upload Your Resume'}</p>
                  <p className="text-sm text-dark-500">PDF format • Max 10MB</p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
                    <RiFileTextLine className="h-7 w-7 text-emerald-400" />
                  </div>
                  <p className="mb-1 font-semibold text-white">{file.name}</p>
                  <p className="mb-3 text-xs text-dark-500">{formatFileSize(file.size)}</p>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs text-dark-400 hover:text-white">
                    <RiCloseLine className="h-3.5 w-3.5" /> Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Target Role Selector */}
          {file && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6">
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                    <RiBriefcaseLine className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Target Role <span className="text-red-400">*</span></h3>
                    <p className="text-xs text-dark-500">What career do you want the roadmap for?</p>
                  </div>
                </div>

                {targetRole ? (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3">
                      <RiBriefcaseLine className="h-4 w-4 text-teal-400" />
                      <span className="text-sm font-medium text-teal-200">{targetRole}</span>
                    </div>
                    <button onClick={() => setTargetRole('')} className="rounded-xl border border-white/10 px-3 py-3 text-xs text-dark-400 hover:text-white">Change</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
                      <input
                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) setTargetRole(searchQuery.trim()); }}
                        placeholder="Search or type a role..." autoFocus
                        className="w-full rounded-xl border border-white/10 bg-dark-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 outline-none focus:border-teal-500/40"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(searchQuery ? filteredRoles : ROLE_SUGGESTIONS).slice(0, 12).map((role) => (
                        <button key={role} onClick={() => setTargetRole(role)}
                          className="rounded-lg border border-white/8 bg-white/3 px-2.5 py-1.5 text-xs text-dark-300 hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-200"
                        >{role}</button>
                      ))}
                      {searchQuery.trim() && !ROLE_SUGGESTIONS.some(r => r.toLowerCase() === searchQuery.toLowerCase()) && (
                        <button onClick={() => setTargetRole(searchQuery.trim())}
                          className="rounded-lg border border-dashed border-teal-500/30 bg-teal-500/5 px-2.5 py-1.5 text-xs text-teal-300 hover:bg-teal-500/10"
                        ><RiSparklingFill className="mr-1 inline h-3 w-3" /> Use "{searchQuery.trim()}"</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Submit */}
          {file && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 text-center">
              <button onClick={onSubmit} disabled={!targetRole}
                className={`btn-gradient !px-10 !py-4 !text-base !rounded-2xl group w-full sm:w-auto ${!targetRole ? 'opacity-50 cursor-not-allowed saturate-0' : ''}`}
                style={{ background: targetRole ? 'linear-gradient(135deg, #14b8a6, #06b6d4)' : undefined }}
              >
                <RiRoadMapLine className="h-5 w-5" />
                {targetRole ? `Generate ${targetRole} Roadmap` : 'Select a role first'}
                <RiArrowRightLine className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RoadmapPage;
