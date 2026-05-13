import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiErrorWarningLine, RiHomeLine, RiArrowLeftLine } from 'react-icons/ri';

const ErrorPage = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
  >
    {/* Background orbs */}
    <div className="fixed inset-0 -z-10">
      <div className="gradient-orb left-1/3 top-1/4 h-96 w-96 bg-red-500" />
      <div className="gradient-orb right-1/3 bottom-1/4 h-80 w-80 bg-primary-500" />
      <div className="absolute inset-0 grid-bg" />
    </div>

    <motion.div
      initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-red-500/[0.08] border border-red-500/10">
        <RiErrorWarningLine className="h-14 w-14 text-red-400" />
      </div>
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-3 font-display text-7xl font-bold gradient-text"
    >
      404
    </motion.h1>
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-4 font-display text-2xl font-semibold text-white"
    >
      Page Not Found
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-10 max-w-md text-dark-400 leading-relaxed"
    >
      The page you're looking for doesn't exist or has been moved. Let's get you back on track.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <Link to="/" className="btn-gradient !rounded-2xl">
        <RiHomeLine className="h-5 w-5" /> Go Home
      </Link>
      <button
        onClick={() => window.history.back()}
        className="btn-outline !rounded-2xl"
      >
        <RiArrowLeftLine className="h-5 w-5" /> Go Back
      </button>
    </motion.div>
  </motion.div>
);

export default ErrorPage;
