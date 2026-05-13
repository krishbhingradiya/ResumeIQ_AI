import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { RiCheckboxCircleLine } from 'react-icons/ri';

const benefits = [
  'ATS-optimized resume scoring in seconds',
  'Detect hidden skill gaps before recruiters do',
  'Get personalized job role recommendations',
  'Improve your chances by 3x with AI insights',
  'Free to use — no sign-up required',
  'Powered by Google Gemini AI technology',
];

const barData = [
  { label: 'ATS Compatibility', value: 92, color: 'from-emerald-500 to-teal-500' },
  { label: 'Keyword Optimization', value: 85, color: 'from-primary-500 to-blue-500' },
  { label: 'Content Quality', value: 78, color: 'from-accent-500 to-pink-500' },
  { label: 'Format Score', value: 95, color: 'from-amber-500 to-orange-500' },
];

const Benefits = () => {
  const barsRef = useRef(null);
  const barsInView = useInView(barsRef, { once: true, margin: '-50px' });

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 gradient-divider" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-4 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-1.5 text-[13px] font-medium text-emerald-300">
              Benefits
            </span>
            <h2 className="section-title text-white">
              Why Choose <span className="gradient-text">ResumeIQ AI</span>?
            </h2>
            <p className="mt-4 text-dark-400 leading-relaxed">
              Stand out from the competition with data-driven resume optimization that gets you past ATS filters and into interviews.
            </p>
            <ul className="mt-8 space-y-3.5">
              {benefits.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span className="text-[15px] text-dark-300">{b}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 blur-2xl" />
            <div ref={barsRef} className="glass-card relative p-8">
              <div className="space-y-5">
                {barData.map((item, i) => (
                  <div key={i}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-dark-300 font-medium">{item.label}</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={barsInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.5 + i * 0.15 }}
                        className="font-semibold text-white tabular-nums"
                      >
                        {item.value}%
                      </motion.span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-dark-800/80">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={barsInView ? { width: `${item.value}%` } : {}}
                        transition={{ delay: 0.3 + i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        style={{ boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
