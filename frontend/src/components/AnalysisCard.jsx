import { motion } from 'framer-motion';

const AnalysisCard = ({ title, icon: Icon, gradient, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className="glass-card-hover p-6"
  >
    <div className="mb-5 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="font-display text-[15px] font-semibold text-white">{title}</h3>
    </div>
    <div>{children}</div>
  </motion.div>
);

export const SkillBadge = ({ skill, variant = 'default' }) => {
  const variants = {
    default: 'border-primary-500/15 bg-primary-500/[0.08] text-primary-300',
    success: 'border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-300',
    warning: 'border-amber-500/15 bg-amber-500/[0.08] text-amber-300',
    danger: 'border-red-500/15 bg-red-500/[0.08] text-red-300',
    purple: 'border-accent-500/15 bg-accent-500/[0.08] text-accent-300',
    blue: 'border-blue-500/15 bg-blue-500/[0.08] text-blue-300',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-block rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.04] ${variants[variant]}`}
    >
      {skill}
    </motion.span>
  );
};

export const ListItem = ({ text, icon: Icon, color = 'text-primary-400' }) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.08]">
    {Icon && <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${color}`} />}
    <span className="text-sm leading-relaxed text-dark-300">{text}</span>
  </div>
);

export default AnalysisCard;
