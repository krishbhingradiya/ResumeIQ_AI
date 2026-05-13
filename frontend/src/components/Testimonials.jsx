import { motion } from 'framer-motion';
import { RiStarFill, RiDoubleQuotesL } from 'react-icons/ri';

const testimonials = [
  { name: 'Aarav Mehta', role: 'SDE-II at Flipkart', text: 'ResumeIQ AI helped me identify gaps I never noticed. After implementing the suggestions, I got 3x more interview calls from top startups!', rating: 5 },
  { name: 'Sneha Kulkarni', role: 'Product Manager at Razorpay', text: 'The ATS score feature is a game-changer. I went from being filtered out to landing interviews at top Indian tech companies.', rating: 5 },
  { name: 'Priya Sharma', role: 'Data Scientist at Amazon India', text: 'Incredible tool! The skill gap analysis showed me exactly what certifications to pursue. Landed my dream role in 2 months.', rating: 5 },
];

const Testimonials = () => (
  <section className="relative py-24 sm:py-32">
    <div className="absolute inset-x-0 top-0 gradient-divider" />

    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <span className="mb-4 inline-block rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-4 py-1.5 text-[13px] font-medium text-amber-300">
          Testimonials
        </span>
        <h2 className="section-title text-white">
          Loved by <span className="gradient-text">Professionals</span>
        </h2>
        <p className="section-subtitle mt-5">See how ResumeIQ AI has transformed careers worldwide.</p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card-hover p-6"
          >
            <RiDoubleQuotesL className="mb-4 h-7 w-7 text-primary-500/20" />
            <p className="mb-6 text-sm leading-relaxed text-dark-300">"{t.text}"</p>
            <div className="flex items-center gap-3 border-t border-white/[0.04] pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 font-display text-sm font-bold text-white ring-2 ring-primary-500/20">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-[11px] text-dark-500">{t.role}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <RiStarFill key={j} className="h-3.5 w-3.5 text-amber-400" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
