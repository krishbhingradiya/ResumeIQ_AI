import { motion } from 'framer-motion';
import { RiUploadCloud2Line, RiBrainLine, RiBarChartBoxLine, RiRocketLine } from 'react-icons/ri';

const steps = [
  { icon: RiUploadCloud2Line, step: '01', title: 'Upload Resume', description: 'Drag & drop your PDF resume or click to browse files.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: RiBrainLine, step: '02', title: 'AI Analysis', description: 'Our Gemini AI extracts and analyzes every detail of your resume.', gradient: 'from-primary-500 to-accent-500' },
  { icon: RiBarChartBoxLine, step: '03', title: 'Get Insights', description: 'Receive ATS score, skill analysis, and improvement suggestions.', gradient: 'from-accent-500 to-pink-500' },
  { icon: RiRocketLine, step: '04', title: 'Boost Career', description: 'Apply recommendations and land your dream job faster.', gradient: 'from-emerald-500 to-teal-500' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="relative py-24 sm:py-32">
    <div className="absolute inset-x-0 top-0 gradient-divider" />

    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <span className="mb-4 inline-block rounded-full border border-accent-500/20 bg-accent-500/[0.08] px-4 py-1.5 text-[13px] font-medium text-accent-300">
          How It Works
        </span>
        <h2 className="section-title text-white">
          Four Simple Steps to <span className="gradient-text">Career Success</span>
        </h2>
        <p className="section-subtitle mt-5">Get from upload to actionable insights in under 10 seconds.</p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group relative text-center"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="absolute top-12 left-[60%] hidden h-px w-[80%] lg:block"
                style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)' }}
              />
            )}
            <div className={`relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]`}>
              <s.icon className="h-10 w-10 text-white" />
              <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-dark-950 text-[11px] font-bold text-white ring-2 ring-white/10 font-mono">
                {s.step}
              </span>
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-white">{s.title}</h3>
            <p className="text-sm leading-relaxed text-dark-400">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
