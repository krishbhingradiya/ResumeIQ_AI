import { motion } from 'framer-motion';
import ParticlesBackground from '../components/ParticlesBackground';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const LandingPage = () => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    <ParticlesBackground />
    <Hero />
    <Features />
    <HowItWorks />
    <Benefits />
    <Testimonials />
  </motion.div>
);

export default LandingPage;
