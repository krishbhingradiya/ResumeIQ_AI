import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiShieldCheckLine, RiUploadCloud2Line, RiFileTextLine, RiCloseLine, RiSparklingFill, RiArrowRightLine, RiShieldLine } from 'react-icons/ri';
import { getAuthenticity } from '../services/api';
import { validatePDF, formatFileSize } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AuthenticityPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

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

  const onSubmit = async () => {
    if (!file) return;
    setAnalyzing(true);
    toast.loading('Analyzing resume authenticity...', { id: 'auth' });
    try {
      const data = await getAuthenticity(file);
      toast.success('Authenticity analysis complete!', { id: 'auth' });
      navigate('/authenticity-results', { state: { results: data.result, fileName: file.name } });
    } catch (err) {
      toast.error(err.message, { id: 'auth' });
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          <LoadingSpinner text="AI is scanning for authenticity patterns..." />
          <p className="mt-4 text-center text-sm text-dark-400">Detecting AI-generated content, fake experience, and keyword stuffing...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-28 pb-20 sm:pt-36">
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/3 top-1/4 h-96 w-96 bg-red-500" />
        <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-amber-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-2xl px-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-sm text-red-300">
            <RiShieldLine className="mr-1.5 inline h-3.5 w-3.5" /> Recruiter Intelligence
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            <RiShieldCheckLine className="mr-2 inline h-8 w-8 text-red-400" />
            Resume <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">Authenticity</span> Scanner
          </h1>
          <p className="mt-3 text-dark-400">Detect AI-generated content, fake experience, keyword stuffing & red flags</p>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 blur-xl opacity-60" />
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`glass-card relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all sm:p-16 ${
                isDragging ? 'border-red-400 bg-red-500/10 scale-[1.02]' : file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-red-500/30 hover:bg-white/5'
              }`}
              onClick={() => !file && document.getElementById('authFileInput').click()}
            >
              <input id="authFileInput" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} className="hidden" />
              {!file ? (
                <>
                  <motion.div animate={isDragging ? { scale: 1.1 } : { scale: 1 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20">
                    <RiShieldCheckLine className="h-8 w-8 text-red-400" />
                  </motion.div>
                  <p className="mb-2 text-lg font-semibold text-white">{isDragging ? 'Drop it here!' : 'Upload Resume for Authenticity Check'}</p>
                  <p className="mb-4 text-sm text-dark-500">Drag & drop or click to browse</p>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-dark-500">
                    <RiFileTextLine className="h-3.5 w-3.5" /> PDF format • Max 10MB
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
                    <RiFileTextLine className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="mb-1 text-lg font-semibold text-white">{file.name}</p>
                  <p className="mb-4 text-sm text-dark-500">{formatFileSize(file.size)}</p>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-dark-400 hover:bg-white/5 hover:text-white">
                    <RiCloseLine className="h-3.5 w-3.5" /> Change file
                  </button>
                </div>
              )}
            </div>
          </div>

          {file && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-center">
              <button onClick={onSubmit} className="btn-gradient !px-10 !py-4 !text-base !rounded-2xl group w-full sm:w-auto" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                <RiShieldCheckLine className="h-5 w-5" /> Scan for Authenticity
                <RiArrowRightLine className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Feature highlights */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { icon: '🤖', label: 'AI Content Detection' },
            { icon: '🔍', label: 'Fake Experience Check' },
            { icon: '⚠️', label: 'Keyword Stuffing' },
            { icon: '📊', label: 'Authenticity Score' },
            { icon: '🛡️', label: 'Trust Rating' },
            { icon: '📋', label: 'Red Flag Report' },
          ].map((f, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <span className="mb-2 block text-2xl">{f.icon}</span>
              <span className="text-xs font-medium text-dark-300">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthenticityPage;
