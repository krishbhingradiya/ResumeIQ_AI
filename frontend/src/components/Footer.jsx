import { Link } from 'react-router-dom';
import { RiSparklingFill, RiGithubLine, RiTwitterXLine, RiLinkedinLine, RiHeartFill } from 'react-icons/ri';

const Footer = () => (
  <footer className="relative border-t border-white/[0.04]">
    {/* Top gradient line */}
    <div className="absolute inset-x-0 top-0 gradient-divider" />

    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="group inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20 transition-all duration-300 group-hover:shadow-primary-500/40">
              <RiSparklingFill className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Resume<span className="gradient-text">IQ</span>{' '}
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-400/80">AI</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-dark-500">
            Smart AI-Powered Resume Analysis for Modern Careers. Built with Gemini AI.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-dark-400">Product</h4>
          <ul className="space-y-2.5 text-sm text-dark-500">
            <li><Link to="/upload" className="transition-colors hover:text-primary-400">Analyze Resume</Link></li>
            <li><Link to="/compare" className="transition-colors hover:text-primary-400">Compare Resumes</Link></li>
            <li><Link to="/jd-match" className="transition-colors hover:text-primary-400">JD Matcher</Link></li>
            <li><a href="#features" className="transition-colors hover:text-primary-400">Features</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-dark-400">Company</h4>
          <ul className="space-y-2.5 text-sm text-dark-500">
            <li><Link to="/about" className="transition-colors hover:text-primary-400">About</Link></li>
            <li><a href="#" className="transition-colors hover:text-primary-400">Privacy Policy</a></li>
            <li><a href="#" className="transition-colors hover:text-primary-400">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-dark-400">Connect</h4>
          <div className="flex gap-2.5">
            {[RiGithubLine, RiTwitterXLine, RiLinkedinLine].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-dark-500 transition-all hover:border-primary-500/30 hover:bg-white/[0.04] hover:text-white hover:shadow-lg hover:shadow-primary-500/5"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-8 sm:flex-row">
        <p className="text-xs text-dark-600">&copy; {new Date().getFullYear()} ResumeIQ AI. All rights reserved.</p>
        <p className="flex items-center gap-1.5 text-xs text-dark-600">
          Made with <RiHeartFill className="h-3 w-3 text-red-500/70" /> using React & Gemini AI
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
