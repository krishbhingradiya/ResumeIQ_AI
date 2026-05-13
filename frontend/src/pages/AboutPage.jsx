import { motion } from 'framer-motion';
import { RiSparklingFill, RiBrainLine, RiShieldCheckLine, RiTeamLine, RiGlobalLine, RiLockLine } from 'react-icons/ri';

const values = [
  { icon: RiBrainLine, title: 'AI-First Approach', description: 'Built on Google Gemini AI for cutting-edge resume analysis.', gradient: 'from-primary-500 to-accent-500' },
  { icon: RiShieldCheckLine, title: 'Privacy Focused', description: 'Your resume data is never stored or shared with third parties.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: RiTeamLine, title: 'Built for Everyone', description: 'From fresh graduates to seasoned professionals — we help all.', gradient: 'from-amber-500 to-orange-500' },
  { icon: RiGlobalLine, title: 'Global Standards', description: 'Analysis based on international hiring and ATS standards.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: RiLockLine, title: 'Secure Processing', description: 'Enterprise-grade security for all resume processing.', gradient: 'from-pink-500 to-rose-500' },
  { icon: RiSparklingFill, title: 'Always Improving', description: 'Continuously updated AI models for better accuracy.', gradient: 'from-violet-500 to-purple-500' },
];

const AboutPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-28 pb-20 sm:pt-36">
    <div className="fixed inset-0 -z-10">
      <div className="gradient-orb left-1/3 top-1/4 h-96 w-96 bg-primary-500" />
      <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-accent-500" />
      <div className="absolute inset-0 grid-bg" />
    </div>
    <div className="mx-auto max-w-4xl px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-16 text-center">
        <span className="mb-4 inline-block rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-300">About Us</span>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">About <span className="gradient-text">ResumeIQ AI</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-dark-400">We're on a mission to democratize career success by making professional resume analysis accessible to everyone through the power of artificial intelligence.</p>
      </motion.div>
      <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card-hover p-6">
            <div className={`mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${v.gradient} p-3`}>
              <v.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-white">{v.title}</h3>
            <p className="text-sm text-dark-400">{v.description}</p>
          </motion.div>
        ))}
      </div>
      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8 text-center">
        <h3 className="mb-6 font-display text-2xl font-bold text-white">Our Tech Stack</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {['React.js', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Express', 'Google Gemini AI', 'pdf-parse'].map((tech) => (
            <span key={tech} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-dark-300">{tech}</span>
          ))}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

export default AboutPage;
