import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSparklingFill } from 'react-icons/ri';

const DEFAULT_STAGES = [
  { icon: '📄', label: 'Uploading Resume', sub: 'Processing your document...' },
  { icon: '🔍', label: 'Extracting Content', sub: 'Reading PDF structure & text...' },
  { icon: '🧠', label: 'Running AI Analysis', sub: 'Gemini AI is evaluating your resume...' },
  { icon: '📊', label: 'Scoring & Ranking', sub: 'Calculating ATS compatibility...' },
  { icon: '✨', label: 'Generating Insights', sub: 'Creating personalized recommendations...' },
  { icon: '✅', label: 'Finalizing Results', sub: 'Preparing your dashboard...' },
];

const LoadingSpinner = ({
  text = 'Analyzing your resume...',
  stages = DEFAULT_STAGES,
  showStages = true,
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [dots, setDots] = useState('');

  // Animate through stages
  useEffect(() => {
    if (!showStages) return;
    const interval = setInterval(() => {
      setCurrentStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, [stages.length, showStages]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.round(((currentStage + 1) / stages.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Main spinner */}
      <div className="relative mb-8">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 opacity-20 blur-xl animate-pulse" />
        
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="h-24 w-24 rounded-full border-[2.5px] border-transparent"
          style={{
            borderTopColor: '#6366f1',
            borderRightColor: '#a855f7',
          }}
        />
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-3 rounded-full border-[2px] border-transparent"
          style={{
            borderBottomColor: 'rgba(99, 102, 241, 0.5)',
            borderLeftColor: 'rgba(168, 85, 247, 0.5)',
          }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <RiSparklingFill className="h-7 w-7 text-primary-400" />
          </motion.div>
        </div>
      </div>

      {/* Primary text */}
      <motion.p
        key={text}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-base font-medium text-white"
      >
        {text}
      </motion.p>

      {/* Progress bar */}
      {showStages && (
        <div className="mb-6 w-full max-w-xs">
          <div className="mb-1.5 flex justify-between text-[10px] text-dark-500">
            <span>Processing{dots}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-dark-800/80">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
              style={{
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
              }}
            />
          </div>
        </div>
      )}

      {/* Stage indicators */}
      {showStages && (
        <div className="w-full max-w-sm space-y-1.5">
          {stages.map((stage, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: i <= currentStage ? 1 : 0.25,
                x: 0,
              }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={`processing-stage ${
                i === currentStage ? 'active' :
                i < currentStage ? 'completed' : 'pending'
              }`}
            >
              <span className="text-base flex-shrink-0">
                {i < currentStage ? '✅' : stage.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-tight ${
                  i <= currentStage ? 'text-white' : 'text-dark-600'
                }`}>
                  {stage.label}
                </p>
                <p className="text-[10px] text-dark-500 leading-tight truncate">
                  {stage.sub}
                </p>
              </div>
              {i === currentStage && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-400"
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Subtle tagline */}
      <motion.p
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mt-6 text-[10px] text-dark-600 tracking-wider"
      >
        Powered by ResumeIQ AI
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
