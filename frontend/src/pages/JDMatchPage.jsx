import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  RiFileTextLine, RiCrosshairLine, RiUploadCloud2Line, RiSparklingFill,
  RiCheckLine, RiCloseLine, RiArrowRightLine, RiDeleteBinLine
} from 'react-icons/ri';
import { matchJD } from '../services/api';

const STEPS = [
  { icon: '📄', label: 'Uploading Resume', sub: 'Processing PDF...' },
  { icon: '📋', label: 'Reading Job Description', sub: 'Extracting requirements...' },
  { icon: '🔍', label: 'Matching Keywords', sub: 'Comparing skills & qualifications...' },
  { icon: '📊', label: 'Calculating Match', sub: 'Running ATS compatibility analysis...' },
  { icon: '✨', label: 'Generating Insights', sub: 'Creating optimization tips...' },
];

const JDMatchPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      const f = accepted[0];
      if (f.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
      if (f.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }
      setFile(f);
      toast.success('Resume uploaded!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, multiple: false
  });

  const handleSubmit = async () => {
    if (!file) { toast.error('Please upload a resume first'); return; }
    if (jobDescription.trim().length < 50) { toast.error('Job description must be at least 50 characters'); return; }

    setIsAnalyzing(true);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => prev < STEPS.length - 1 ? prev + 1 : prev);
    }, 3000);

    try {
      const data = await matchJD(file, jobDescription);
      clearInterval(stepInterval);
      toast.success('Match analysis complete!');
      navigate('/jd-results', { state: { result: data.result, fileName: file.name } });
    } catch (err) {
      clearInterval(stepInterval);
      toast.error(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/3 top-1/4 h-96 w-96 bg-emerald-500" />
        <div className="gradient-orb right-1/4 bottom-1/3 h-80 w-80 bg-primary-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
            <RiCrosshairLine className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Job Description <span className="gradient-text">Matcher</span>
          </h1>
          <p className="mt-3 text-dark-400">Upload your resume & paste a job description to see how well you match</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} className="mx-auto max-w-lg">
              <div className="glass-card p-8 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                  <RiSparklingFill className="h-8 w-8 text-emerald-400" />
                </motion.div>
                <h3 className="mb-6 font-display text-xl font-bold text-white">Analyzing Match...</h3>
                <div className="space-y-3">
                  {STEPS.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 rounded-xl p-3 text-left text-sm transition-all ${
                        i === currentStep ? 'bg-emerald-500/10 border border-emerald-500/20' :
                        i < currentStep ? 'bg-white/5' : ''
                      }`}>
                      <span className="text-lg">{i < currentStep ? '✅' : step.icon}</span>
                      <div>
                        <p className={`font-medium ${i <= currentStep ? 'text-white' : 'text-dark-600'}`}>{step.label}</p>
                        <p className="text-xs text-dark-500">{step.sub}</p>
                      </div>
                      {i === currentStep && (
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                          className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid gap-6 lg:grid-cols-2">
              {/* Left: Resume Upload */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="glass-card h-full p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                    <RiFileTextLine className="h-5 w-5 text-primary-400" /> Step 1: Upload Resume
                  </h3>
                  {!file ? (
                    <div {...getRootProps()}
                      className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
                        isDragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-primary-500/50 hover:bg-white/5'
                      }`}>
                      <input {...getInputProps()} />
                      <RiUploadCloud2Line className="mb-3 h-10 w-10 text-dark-500" />
                      <p className="text-sm font-medium text-dark-300">
                        {isDragActive ? 'Drop your resume here...' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="mt-1 text-xs text-dark-600">PDF only, max 10MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                        <RiCheckLine className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-dark-500">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button onClick={() => setFile(null)} className="text-dark-500 hover:text-red-400 transition-colors">
                        <RiDeleteBinLine className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Right: Job Description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="glass-card h-full p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
                    <RiCrosshairLine className="h-5 w-5 text-emerald-400" /> Step 2: Paste Job Description
                  </h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here...&#10;&#10;Include: Job title, requirements, responsibilities, qualifications, skills needed..."
                    className="h-[200px] w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-dark-200 placeholder-dark-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                  <p className="mt-2 text-xs text-dark-600">
                    {jobDescription.length} / 50 min characters
                    {jobDescription.length >= 50 && <RiCheckLine className="ml-1 inline h-3 w-3 text-emerald-400" />}
                  </p>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="lg:col-span-2 text-center">
                <button onClick={handleSubmit}
                  disabled={!file || jobDescription.trim().length < 50}
                  className="btn-gradient !rounded-2xl !px-10 !py-4 !text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none">
                  <RiSparklingFill className="h-5 w-5" />
                  Analyze Match
                  <RiArrowRightLine className="h-5 w-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default JDMatchPage;
