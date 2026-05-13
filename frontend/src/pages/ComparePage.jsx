import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUploadCloud2Line, RiFileTextLine, RiCloseLine, RiSparklingFill,
  RiArrowRightLine, RiAddCircleLine, RiScales3Line
} from 'react-icons/ri';
import { compareResumes } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatFileSize } from '../utils/helpers';
import toast from 'react-hot-toast';

const MAX_FILES = 50; // Practical limit to prevent browser crash, effectively unlimited

const ComparePage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compareStep, setCompareStep] = useState(0); // which resume is being analyzed

  const addFiles = useCallback((newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf');
    if (pdfs.length === 0) { toast.error('Only PDF files are allowed'); return; }

    setFiles(prev => {
      const combined = [...prev, ...pdfs];
      if (combined.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} resumes allowed at once`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onFileChange = (e) => { if (e.target.files) addFiles(e.target.files); };

  const onCompare = async () => {
    if (files.length < 2) { toast.error('Please add at least 2 resumes to compare'); return; }
    setIsComparing(true);
    setProgress(0);
    setCompareStep(0);
    try {
      const data = await compareResumes(files, setProgress);
      navigate('/compare-results', { state: { comparison: data.comparison } });
    } catch (err) {
      toast.error(err.message || 'Comparison failed. Please try again.');
      setIsComparing(false);
      setCompareStep(0);
    }
  };

  const levelColor = {
    student: 'text-sky-300', fresher: 'text-emerald-300',
    junior: 'text-blue-300', mid: 'text-violet-300', senior: 'text-amber-300',
  };

  if (isComparing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-md px-4 text-center">
          <LoadingSpinner text={`Deep-analyzing and ranking ${files.length} resumes…`} />
          {progress > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm text-dark-400">
                <span>Sending to AI…</span><span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-dark-800">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
              </div>
            </div>
          )}
          <p className="mt-5 text-sm text-dark-400">
            Comparing all resumes strictly against the ATS rubric.
          </p>
          <p className="mt-2 text-xs text-dark-600">
            ⏱ Est. time: 10–20 seconds (Lightning Fast)
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-20 sm:pt-36">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/4 top-1/3 h-96 w-96 bg-primary-500" />
        <div className="gradient-orb right-1/4 bottom-1/3 h-80 w-80 bg-accent-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-300">
            <RiScales3Line className="mr-1.5 inline h-3.5 w-3.5" /> Resume Battle Mode
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Compare <span className="gradient-text">Resumes</span>
          </h1>
          <p className="mt-3 text-dark-400">Upload multiple resumes — AI picks the winner and explains why</p>
        </motion.div>

        {/* Drop zone */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative mb-6">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-xl opacity-60" />
              <div
                onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                onClick={() => document.getElementById('compareFileInput').click()}
                className={`glass-card relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                  isDragging ? 'border-primary-400 bg-primary-500/10 scale-[1.02]' : 'border-white/10 hover:border-primary-500/30 hover:bg-white/5'
                }`}
              >
                <input id="compareFileInput" type="file" accept=".pdf" multiple onChange={onFileChange} className="hidden" />
                <motion.div animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                  <RiUploadCloud2Line className="h-7 w-7 text-primary-400" />
                </motion.div>
                <p className="mb-1 text-base font-semibold text-white">
                  {isDragging ? 'Drop PDFs here!' : 'Drag & drop resumes here'}
                </p>
                <p className="mb-3 text-sm text-dark-500">or click to browse • PDF only • Max 10MB each</p>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-dark-500">
                  <RiAddCircleLine className="h-3.5 w-3.5" />
                  {files.length === 0 ? 'Add resumes' : `Add more resumes`}
                </div>
              </div>
            </div>

          {/* Uploaded files list */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-3">
                <p className="text-sm font-medium text-dark-400">{files.length} resume{files.length > 1 ? 's' : ''} added</p>
                {files.map((file, i) => (
                  <motion.div key={`${file.name}-${i}`}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }}
                    className="glass-card flex items-center gap-4 rounded-xl p-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      i === 0 ? 'bg-primary-500/20 text-primary-300' : 'bg-dark-800 text-dark-400'
                    }`}>
                      #{i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-dark-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button onClick={() => removeFile(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-dark-500 transition-colors hover:bg-white/10 hover:text-white">
                      <RiCloseLine className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compare button */}
          {files.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <button onClick={onCompare}
                className="btn-gradient w-full !px-10 !py-4 !text-base !rounded-2xl group sm:w-auto">
                <RiScales3Line className="h-5 w-5 transition-transform group-hover:rotate-12" />
                Compare {files.length} Resumes with AI
                <RiArrowRightLine className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}

          {files.length === 1 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-dark-500">
              Add at least 1 more resume to start comparing
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ComparePage;
