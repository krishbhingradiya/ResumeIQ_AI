import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { RiSparklingFill, RiArrowDownSLine, RiShieldCheckLine, RiRoadMapLine, RiTeamLine } from 'react-icons/ri';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Analyze', path: '/upload' },
  { name: 'Compare', path: '/compare' },
  { name: 'JD Match', path: '/jd-match' },
  { name: 'Interview', path: '/mock-interview' },
];

const moreLinks = [
  { name: 'Authenticity Scanner', path: '/authenticity', icon: RiShieldCheckLine, badge: 'NEW', color: 'text-red-400' },
  { name: 'Career Roadmap', path: '/roadmap', icon: RiRoadMapLine, badge: 'NEW', color: 'text-teal-400' },
  { name: 'AI Shortlisting', path: '/shortlist', icon: RiTeamLine, badge: 'NEW', color: 'text-violet-400' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setMoreOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const isMoreActive = useMemo(
    () => moreLinks.some(l => location.pathname === l.path),
    [location.pathname]
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-dark-950/80 backdrop-blur-2xl border-b border-white/[0.04] shadow-2xl shadow-dark-950/50'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-[72px]">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary-500/40">
              <RiSparklingFill className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-50" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
              Resume<span className="gradient-text">IQ</span>
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-primary-400/80">AI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg bg-white/[0.08]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`relative flex items-center gap-1 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-300 ${
                  moreOpen || isMoreActive ? 'text-white' : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                {isMoreActive && (
                  <motion.div layoutId="navbar-active" className="absolute inset-0 rounded-lg bg-white/[0.08]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  More
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-primary-500/30 to-accent-500/30 px-1 text-[9px] font-bold text-primary-300">3</span>
                  <RiArrowDownSLine className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.06] bg-dark-950/95 backdrop-blur-2xl shadow-2xl shadow-dark-950/80"
                  >
                    <div className="p-1.5">
                      {moreLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all ${
                            location.pathname === link.path ? 'bg-white/[0.08] text-white' : 'text-dark-300 hover:bg-white/[0.04] hover:text-white'
                          }`}
                        >
                          <link.icon className={`h-4 w-4 ${link.color}`} />
                          <span className="flex-1">{link.name}</span>
                          {link.badge && (
                            <span className="rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/upload" className="ml-4 btn-gradient !py-2 !px-5 !text-[13px] !rounded-xl">
              <RiSparklingFill className="h-3.5 w-3.5" />
              Analyze Resume
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-dark-400 transition-all hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.04] bg-dark-950/98 backdrop-blur-2xl lg:hidden"
          >
            <div className="space-y-0.5 px-4 py-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'bg-white/[0.06] text-white'
                        : 'text-dark-400 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <div className="my-2 gradient-divider" />
              {moreLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + i) * 0.04 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'bg-white/[0.06] text-white'
                        : 'text-dark-400 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <link.icon className={`h-4 w-4 ${link.color}`} />
                    {link.name}
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                      NEW
                    </span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2"
              >
                <Link
                  to="/upload"
                  className="block w-full btn-gradient !rounded-xl text-center"
                >
                  <RiSparklingFill className="mr-2 inline h-4 w-4" />
                  Analyze Resume
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
