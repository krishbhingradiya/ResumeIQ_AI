import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiUploadCloud2Line, RiFileTextLine, RiCloseLine, RiSparklingFill, RiArrowRightLine, RiBriefcaseLine, RiSearchLine } from 'react-icons/ri';
import useFileUpload from '../hooks/useFileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatFileSize } from '../utils/helpers';

// Popular career roles grouped by category
const ROLE_CATEGORIES = [
  {
    category: 'Software & Engineering',
    roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer', 'DevOps Engineer', 'Cloud Engineer', 'Software Architect', 'QA / Test Engineer', 'Embedded Systems Engineer'],
  },
  {
    category: 'Data & AI',
    roles: ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI/ML Researcher', 'Data Engineer', 'Business Intelligence Analyst', 'NLP Engineer'],
  },
  {
    category: 'Design & Product',
    roles: ['UI/UX Designer', 'Product Designer', 'Product Manager', 'Graphic Designer', 'UX Researcher'],
  },
  {
    category: 'Cybersecurity & Networking',
    roles: ['Cybersecurity Analyst', 'Penetration Tester', 'Network Engineer', 'Security Engineer', 'SOC Analyst'],
  },
  {
    category: 'Business & Management',
    roles: ['Project Manager', 'Business Analyst', 'Scrum Master', 'Technical Writer', 'IT Consultant', 'Digital Marketing Specialist'],
  },
  {
    category: 'Healthcare & Medical',
    roles: ['Medical Doctor', 'Registered Nurse', 'Healthcare Administrator', 'Pharmacist', 'Physical Therapist', 'Medical Assistant'],
  },
  {
    category: 'Finance & Accounting',
    roles: ['Financial Analyst', 'Accountant', 'Investment Banker', 'Auditor', 'Risk Manager', 'Tax Specialist'],
  },
  {
    category: 'Sales & Marketing',
    roles: ['Sales Manager', 'Account Executive', 'Marketing Director', 'SEO Specialist', 'Content Strategist'],
  },
  {
    category: 'Education & Training',
    roles: ['Teacher', 'Professor', 'Instructional Designer', 'Corporate Trainer', 'School Administrator'],
  },
  {
    category: 'Other Professions',
    roles: ['Lawyer / Attorney', 'Human Resources Manager', 'Operations Manager', 'Mechanical Engineer', 'Civil Engineer'],
  },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const { file, uploading, progress, analyzing, handleFileSelect, handleUpload } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRolePicker, setShowRolePicker] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onFileChange = (e) => {
    if (e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  const onSubmit = async () => {
    if (!targetRole) {
      setShowRolePicker(true);
      return;
    }
    const results = await handleUpload(targetRole);
    if (results) {
      navigate('/dashboard', { state: { results, targetRole } });
    }
  };

  const selectRole = (role) => {
    setTargetRole(role);
    setShowRolePicker(false);
    setSearchQuery('');
  };

  // Filter roles by search
  const filteredCategories = ROLE_CATEGORIES.map((cat) => ({
    ...cat,
    roles: cat.roles.filter((r) => r.toLowerCase().includes(searchQuery.toLowerCase())),
  })).filter((cat) => cat.roles.length > 0);

  if (uploading || analyzing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          <LoadingSpinner text={uploading ? 'Uploading your resume...' : 'AI is analyzing your resume...'} />
          {analyzing && targetRole && (
            <p className="mt-4 text-center text-sm text-dark-400">
              Analyzing for <span className="font-semibold text-primary-300">{targetRole}</span> role
            </p>
          )}
          {uploading && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm text-dark-400">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-dark-800">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-28 pb-20 sm:pt-36">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="gradient-orb left-1/3 top-1/4 h-96 w-96 bg-primary-500" />
        <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-accent-500" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-300">
            <RiSparklingFill className="mr-1.5 inline h-3.5 w-3.5" /> AI Resume Analyzer
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Upload Your Resume</h1>
          <p className="mt-3 text-dark-400">Drop your PDF resume and let our AI do the magic</p>
        </motion.div>

        {/* Upload Area */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 blur-xl opacity-60" />
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`glass-card relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 sm:p-16 ${
                isDragging ? 'border-primary-400 bg-primary-500/10 scale-[1.02]' : file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-primary-500/30 hover:bg-white/5'
              }`}
              onClick={() => !file && document.getElementById('fileInput').click()}
            >
              <input id="fileInput" type="file" accept=".pdf" onChange={onFileChange} className="hidden" />

              {!file ? (
                <>
                  <motion.div animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                    <RiUploadCloud2Line className="h-8 w-8 text-primary-400" />
                  </motion.div>
                  <p className="mb-2 text-lg font-semibold text-white">
                    {isDragging ? 'Drop it here!' : 'Drag & Drop your resume'}
                  </p>
                  <p className="mb-4 text-sm text-dark-500">or click to browse files</p>
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
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFileSelect(null) || document.getElementById('fileInput').click(); }}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-dark-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <RiCloseLine className="h-3.5 w-3.5" /> Change file
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Target Role Selector — appears after file is selected */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500/20 via-primary-500/20 to-accent-500/20 blur-lg opacity-40" />
                <div className="glass-card relative rounded-2xl p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-primary-500/20">
                      <RiBriefcaseLine className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">What is your target profession/role? <span className="text-red-400">*</span></h3>
                      <p className="text-xs text-dark-500">Required: AI will tailor analysis to your exact career path</p>
                    </div>
                  </div>

                  {/* Selected role display or picker button */}
                  {targetRole ? (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
                        <RiBriefcaseLine className="h-4 w-4 text-violet-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-violet-200">{targetRole}</span>
                      </div>
                      <button
                        onClick={() => { setTargetRole(''); setShowRolePicker(true); }}
                        className="rounded-xl border border-white/10 px-3 py-3 text-xs text-dark-400 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRolePicker(!showRolePicker)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-red-500/40 bg-red-500/5 px-4 py-3.5 text-sm text-red-300 transition-all hover:border-red-500/60 hover:bg-red-500/10"
                    >
                      <RiSearchLine className="h-4 w-4 transition-colors group-hover:text-red-400" />
                      <span>Select your target profession to continue...</span>
                    </button>
                  )}

                  {/* Role picker dropdown */}
                  <AnimatePresence>
                    {showRolePicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          {/* Search input */}
                          <div className="relative">
                            <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search professions... (e.g. Doctor, Data Science, HR)"
                              className="w-full rounded-xl border border-white/10 bg-dark-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-500 outline-none transition-colors focus:border-violet-500/40 focus:bg-dark-800"
                              autoFocus
                            />
                          </div>
                          
                          <p className="text-xs text-dark-400">Can't find your profession? Just type it and press Enter.</p>

                          {/* Custom role input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) selectRole(searchQuery.trim());
                              }}
                              placeholder="Or type your own role & press Enter"
                              className="hidden"
                            />
                            {searchQuery.trim() && !ROLE_CATEGORIES.some(c => c.roles.some(r => r.toLowerCase() === searchQuery.toLowerCase())) && (
                              <button
                                onClick={() => selectRole(searchQuery.trim())}
                                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 px-3 py-2 text-xs text-violet-300 transition-colors hover:bg-violet-500/10"
                              >
                                <RiSparklingFill className="h-3 w-3" />
                                Use custom: &quot;{searchQuery.trim()}&quot;
                              </button>
                            )}
                          </div>

                          {/* Role categories */}
                          <div className="max-h-64 overflow-y-auto pr-1 scrollbar-thin space-y-3">
                            {filteredCategories.map((cat) => (
                              <div key={cat.category}>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-dark-500">{cat.category}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {cat.roles.map((role) => (
                                    <button
                                      key={role}
                                      onClick={() => selectRole(role)}
                                      className="rounded-lg border border-white/8 bg-white/3 px-2.5 py-1.5 text-xs text-dark-300 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200"
                                    >
                                      {role}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {filteredCategories.length === 0 && (
                              <p className="py-4 text-center text-xs text-dark-500">
                                No matching roles found. Press Enter to use your custom role.
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analyze Button */}
          {file && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 text-center">
              <button 
                onClick={onSubmit} 
                disabled={!targetRole}
                className={`btn-gradient !px-10 !py-4 !text-base !rounded-2xl group w-full sm:w-auto transition-all ${
                  !targetRole ? 'opacity-50 cursor-not-allowed saturate-0' : ''
                }`}
              >
                <RiSparklingFill className="h-5 w-5 transition-transform group-hover:rotate-12" />
                {targetRole ? `Analyze for ${targetRole}` : 'Select a profession to Analyze'}
                <RiArrowRightLine className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UploadPage;
