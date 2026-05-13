import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiTeamLine, RiUploadCloud2Line, RiFileTextLine, RiCloseLine, RiSparklingFill, RiArrowRightLine, RiBriefcaseLine, RiDeleteBinLine } from 'react-icons/ri';
import { getShortlist } from '../services/api';
import { validatePDF, formatFileSize } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ShortlistPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [useJD, setUseJD] = useState(false);

  const handleFilesAdd = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const valid = [];
    for (const f of fileArray) {
      const v = validatePDF(f);
      if (!v.valid) { toast.error(`${f.name}: ${v.error}`); continue; }
      if (files.length + valid.length >= 10) { toast.error('Maximum 10 resumes'); break; }
      valid.push(f);
    }
    if (valid.length > 0) {
      setFiles(prev => [...prev, ...valid]);
      toast.success(`${valid.length} resume(s) added`);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    handleFilesAdd(e.dataTransfer.files);
  }, [files]);

  const onSubmit = async () => {
    if (files.length < 2) { toast.error('Upload at least 2 resumes'); return; }
    if (!targetRole && !jobDescription) { toast.error('Specify a target role or job description'); return; }

    setAnalyzing(true);
    toast.loading(`Shortlisting ${files.length} candidates...`, { id: 'shortlist' });
    try {
      const data = await getShortlist(files, targetRole, jobDescription);
      toast.success('Shortlisting complete!', { id: 'shortlist' });
      navigate('/shortlist-results', { state: { results: data.result } });
    } catch (err) {
      toast.error(err.message, { id: 'shortlist' });
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          <LoadingSpinner text={`Ranking ${files.length} candidates with AI...`} />
          <p className="mt-4 text-center text-sm text-dark-400">Analyzing technical depth, impact, ATS readiness & skill alignment...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-28 pb-20 sm:pt-36">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/3 top-1/4 h-96 w-96 bg-violet-500" />
        <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-pink-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <RiTeamLine className="mr-1.5 inline h-3.5 w-3.5" /> Enterprise Recruiter Tool
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            AI <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Shortlisting</span> Assistant
          </h1>
          <p className="mt-3 text-dark-400">Upload 2-10 resumes and let AI rank your candidates instantly</p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-violet-500/20 blur-xl opacity-60" />
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`glass-card relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging ? 'border-violet-400 bg-violet-500/10 scale-[1.02]' : 'border-white/10 hover:border-violet-500/30'
              }`}
              onClick={() => document.getElementById('shortlistFileInput').click()}
            >
              <input id="shortlistFileInput" type="file" accept=".pdf" multiple onChange={(e) => handleFilesAdd(e.target.files)} className="hidden" />
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                <RiTeamLine className="h-7 w-7 text-violet-400" />
              </div>
              <p className="mb-1 text-lg font-semibold text-white">{isDragging ? 'Drop resumes here!' : 'Upload Candidate Resumes'}</p>
              <p className="text-sm text-dark-500">Drop multiple PDFs or click to browse • 2-10 resumes</p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <div className="glass-card rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{files.length} Resume(s) Selected</p>
                  <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <RiFileTextLine className="h-4 w-4 text-violet-400" />
                        <span className="text-sm text-dark-200 truncate max-w-[200px]">{f.name}</span>
                        <span className="text-xs text-dark-500">{formatFileSize(f.size)}</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-dark-500 hover:text-red-400">
                        <RiDeleteBinLine className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {files.length < 10 && (
                  <button onClick={() => document.getElementById('shortlistFileInput').click()}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-violet-500/30 py-2 text-xs text-violet-300 hover:bg-violet-500/5"
                  >+ Add More Resumes</button>
                )}
              </div>
            </motion.div>
          )}

          {/* Target Role or JD */}
          {files.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6">
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                    <RiBriefcaseLine className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Hiring Criteria</h3>
                    <p className="text-xs text-dark-500">Provide a target role or paste a job description</p>
                  </div>
                </div>

                {/* Toggle */}
                <div className="mb-4 flex rounded-xl border border-white/10 p-1">
                  <button onClick={() => setUseJD(false)} className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${!useJD ? 'bg-violet-500/20 text-violet-300' : 'text-dark-400 hover:text-white'}`}>Target Role</button>
                  <button onClick={() => setUseJD(true)} className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${useJD ? 'bg-violet-500/20 text-violet-300' : 'text-dark-400 hover:text-white'}`}>Job Description</button>
                </div>

                {!useJD ? (
                  <input
                    type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Frontend Developer, Data Scientist..."
                    className="w-full rounded-xl border border-white/10 bg-dark-800/60 px-4 py-3 text-sm text-white placeholder-dark-500 outline-none focus:border-violet-500/40"
                  />
                ) : (
                  <textarea
                    value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={6}
                    className="w-full rounded-xl border border-white/10 bg-dark-800/60 px-4 py-3 text-sm text-white placeholder-dark-500 outline-none focus:border-violet-500/40 resize-none"
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Submit */}
          {files.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 text-center">
              <button onClick={onSubmit} disabled={!targetRole && !jobDescription}
                className={`btn-gradient !px-10 !py-4 !text-base !rounded-2xl group w-full sm:w-auto ${(!targetRole && !jobDescription) ? 'opacity-50 cursor-not-allowed saturate-0' : ''}`}
                style={{ background: (targetRole || jobDescription) ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : undefined }}
              >
                <RiTeamLine className="h-5 w-5" />
                Shortlist {files.length} Candidates
                <RiArrowRightLine className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ShortlistPage;
