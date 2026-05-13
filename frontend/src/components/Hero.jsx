import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiSparklingFill, RiArrowRightLine, RiShieldCheckLine, RiTimeLine, RiBarChartBoxLine } from 'react-icons/ri';

// ── Animated counter hook ──
const useAnimatedCounter = (target, duration = 2000, inView = true) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, inView]);
  return count;
};

const Hero = () => {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });

  const analysisTime = useAnimatedCounter(10, 1500, statsInView);
  const accuracyRate = useAnimatedCounter(95, 1800, statsInView);
  const atsOptimized = useAnimatedCounter(100, 2000, statsInView);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient orbs */}
        <motion.div
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="gradient-orb left-[20%] top-[20%] h-[500px] w-[500px] bg-primary-500"
        />
        <motion.div
          animate={{ y: [15, -25, 15], x: [10, -15, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="gradient-orb right-[15%] top-[30%] h-[400px] w-[400px] bg-accent-500"
        />
        <motion.div
          animate={{ y: [10, -20, 10] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="gradient-orb left-[45%] bottom-[15%] h-[350px] w-[350px] bg-blue-500"
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/[0.08] px-4 py-2 text-sm text-primary-300"
          >
            <RiSparklingFill className="h-3.5 w-3.5 animate-pulse" />
            <span className="text-[13px] font-medium tracking-wide">Powered by Google Gemini AI</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
          >
            <span className="text-white">Smart AI-Powered</span>
            <br />
            <span className="gradient-text">Resume Analysis</span>
            <br />
            <span className="text-white">for Modern Careers</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-dark-400 sm:text-lg lg:text-xl"
          >
            Upload your resume and get instant AI analysis with ATS scoring,
            skill detection, personalized improvement suggestions, and career recommendations —
            all in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link to="/upload" className="btn-gradient !px-8 !py-4 !text-[15px] !rounded-2xl group">
              <RiSparklingFill className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              Analyze My Resume
              <RiArrowRightLine className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a href="#how-it-works" className="btn-outline !px-8 !py-4 !text-[15px] !rounded-2xl">
              See How It Works
            </a>
          </motion.div>

          {/* Stats — Animated Counters */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-6 sm:gap-16"
          >
            {[
              { icon: RiTimeLine, label: 'Analysis Time', value: `< ${analysisTime}s`, color: 'text-cyan-400' },
              { icon: RiBarChartBoxLine, label: 'Accuracy Rate', value: `${accuracyRate}%+`, color: 'text-primary-400' },
              { icon: RiShieldCheckLine, label: 'ATS Optimized', value: `${atsOptimized}%`, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <stat.icon className={`h-5 w-5 ${stat.color} mb-0.5`} />
                <span className="font-display text-xl font-bold text-white sm:text-3xl tabular-nums">{stat.value}</span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-dark-500 sm:text-xs">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 80, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-20 w-full max-w-4xl"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-primary-500/15 via-accent-500/15 to-primary-500/15 blur-3xl" />
            
            <div className="glass-card relative overflow-hidden rounded-2xl p-1 sm:rounded-3xl">
              <div className="rounded-xl bg-dark-900/90 p-4 sm:rounded-2xl sm:p-8">
                {/* Mock Dashboard Header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex-1 rounded-lg bg-dark-800/60 px-4 py-1.5 text-center text-[11px] text-dark-600 font-mono">
                    resumeiq.ai/dashboard
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  {[
                    { label: 'ATS Score', value: '87/100', color: 'from-emerald-500 to-teal-500' },
                    { label: 'Skills Found', value: '12', color: 'from-primary-500 to-blue-500' },
                    { label: 'Suggestions', value: '8', color: 'from-accent-500 to-pink-500' },
                    { label: 'Job Matches', value: '5', color: 'from-amber-500 to-orange-500' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-3 sm:p-4"
                    >
                      <div className={`mb-2 h-1 w-8 rounded-full bg-gradient-to-r ${item.color}`} />
                      <p className="font-display text-lg font-bold text-white sm:text-2xl tabular-nums">{item.value}</p>
                      <p className="text-[10px] text-dark-500 sm:text-xs">{item.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Mock skill bars */}
                <div className="mt-5 space-y-2.5 sm:mt-6">
                  {['React.js', 'Node.js', 'Python'].map((skill, i) => (
                    <div key={skill} className="flex items-center gap-3">
                      <span className="w-16 text-[11px] text-dark-400 sm:w-20 font-medium">{skill}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-dark-800/80">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${85 - i * 10}%` }}
                          transition={{ delay: 1.3 + i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-dark-500 w-8 text-right">{85 - i * 10}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
