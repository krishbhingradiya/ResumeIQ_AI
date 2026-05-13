import { motion } from 'framer-motion';
import {
  RiBarChartBoxLine, RiBrainLine, RiShieldCheckLine, RiLightbulbLine,
  RiUserStarLine, RiFileSearchLine, RiSpeedLine, RiRocketLine
} from 'react-icons/ri';

const features = [
  { icon: RiBarChartBoxLine, title: 'ATS Score Analysis', description: 'Get a precise ATS compatibility score with detailed optimization tips.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: RiBrainLine, title: 'AI Skill Detection', description: 'Detect technical and soft skills using advanced Gemini AI.', gradient: 'from-primary-500 to-accent-500' },
  { icon: RiShieldCheckLine, title: 'Strength Analysis', description: "Identify your resume's strongest points that catch recruiter attention.", gradient: 'from-emerald-500 to-teal-500' },
  { icon: RiLightbulbLine, title: 'Smart Suggestions', description: 'Get actionable improvement recommendations for your career growth.', gradient: 'from-amber-500 to-orange-500' },
  { icon: RiUserStarLine, title: 'Job Role Matching', description: 'Discover best-fit job roles perfectly aligned with your profile.', gradient: 'from-pink-500 to-rose-500' },
  { icon: RiFileSearchLine, title: 'Gap Analysis', description: 'Find missing skills and experience gaps before recruiters do.', gradient: 'from-violet-500 to-purple-500' },
  { icon: RiSpeedLine, title: 'Instant Results', description: 'Get comprehensive AI analysis in under 10 seconds.', gradient: 'from-cyan-500 to-blue-500' },
  { icon: RiRocketLine, title: 'Career Boost', description: 'Transform your resume into a powerful career advancement tool.', gradient: 'from-fuchsia-500 to-pink-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const Features = () => (
  <section id="features" className="relative py-24 sm:py-32">
    {/* Subtle section separator */}
    <div className="absolute inset-x-0 top-0 gradient-divider" />

    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <span className="mb-4 inline-block rounded-full border border-primary-500/20 bg-primary-500/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary-300">
          Features
        </span>
        <h2 className="section-title text-white">
          Everything You Need to <span className="gradient-text">Perfect Your Resume</span>
        </h2>
        <p className="section-subtitle mt-5">
          Our AI-powered platform analyzes every aspect of your resume and provides actionable insights to supercharge your career.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((f, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card-hover group p-6">
            <div className={`mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} p-3 shadow-lg transition-all duration-400 group-hover:scale-110 group-hover:shadow-xl`}>
              <f.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 font-display text-[15px] font-semibold text-white">{f.title}</h3>
            <p className="text-sm leading-relaxed text-dark-400">{f.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Features;
