import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ── Lazy-loaded pages for performance ──
const LandingPage = lazy(() => import('./pages/LandingPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const CompareResultsPage = lazy(() => import('./pages/CompareResultsPage'));
const JDMatchPage = lazy(() => import('./pages/JDMatchPage'));
const JDResultsPage = lazy(() => import('./pages/JDResultsPage'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const MockInterviewPage = lazy(() => import('./pages/MockInterviewPage'));
const AuthenticityPage = lazy(() => import('./pages/AuthenticityPage'));
const AuthenticityResultsPage = lazy(() => import('./pages/AuthenticityResultsPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const RoadmapResultsPage = lazy(() => import('./pages/RoadmapResultsPage'));
const ShortlistPage = lazy(() => import('./pages/ShortlistPage'));
const ShortlistResultsPage = lazy(() => import('./pages/ShortlistResultsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

// ── Premium page loading fallback ──
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-transparent border-t-primary-500 border-r-accent-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
        </div>
      </div>
      <span className="text-xs text-dark-500 tracking-wide">Loading...</span>
    </motion.div>
  </div>
);

function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-dark-950 text-dark-200">
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 4000,
          className: 'toast-custom',
          success: {
            iconTheme: { primary: '#6366f1', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Page Transitions */}
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/compare-results" element={<CompareResultsPage />} />
            <Route path="/jd-match" element={<JDMatchPage />} />
            <Route path="/jd-results" element={<JDResultsPage />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/authenticity" element={<AuthenticityPage />} />
            <Route path="/authenticity-results" element={<AuthenticityResultsPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/roadmap-results" element={<RoadmapResultsPage />} />
            <Route path="/shortlist" element={<ShortlistPage />} />
            <Route path="/shortlist-results" element={<ShortlistResultsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
