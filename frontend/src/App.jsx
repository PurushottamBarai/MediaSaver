import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import LoadingSkeleton from './components/LoadingSkeleton';
import { platformsData } from './data/platforms';
import { LanguageProvider } from './context/LanguageContext';
import { trackEvent } from './utils/analytics';

const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PlatformLanding = lazy(() => import('./pages/PlatformLanding'));
const UserGuide = lazy(() => import('./pages/UserGuide'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Dmca = lazy(() => import('./pages/Dmca'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    trackEvent('page_view', { page_path: normalizedPath });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      const input = document.getElementById('video-url-input');
      if (input) input.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

const TrailingSlashRedirect = () => {
  const location = useLocation();
  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
    return <Navigate to={{ ...location, pathname: location.pathname.replace(/\/+$/, '') }} replace />;
  }
  return null;
};

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <TrailingSlashRedirect />
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          
          <Suspense fallback={<div className="flex-1 flex items-center justify-center pt-14"><LoadingSkeleton /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {platformsData.map((platform) => (
                <Route 
                  key={platform.path} 
                  path={platform.path} 
                  element={<PlatformLanding {...platform} />} 
                />
              ))}
              
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/terms-of-service" element={<Terms />} />
              <Route path="/dmca" element={<Dmca />} />
              <Route path="/user-guide" element={<UserGuide />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/guide" element={<Navigate to="/user-guide" replace />} />
              <Route path="/x-video-downloader" element={<Navigate to="/twitter-video-downloader" replace />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          <footer className="w-full border-t border-border mt-auto bg-surface/50">
            <div className="max-w-5xl mx-auto px-4 py-10">
              {/* Platform links grid */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary text-center mb-5">Supported Platforms</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2.5 text-center">
                  {/* Video platforms */}
                  {[
                    { label: 'YouTube Downloader', to: '/youtube-video-downloader' },
                    { label: 'Instagram Downloader', to: '/instagram-reel-downloader' },
                    { label: 'Facebook Downloader', to: '/facebook-video-downloader' },
                    { label: 'X / Twitter Downloader', to: '/twitter-video-downloader' },
                    { label: 'Pinterest Downloader', to: '/pinterest-video-downloader' },
                    { label: 'Reddit Downloader', to: '/reddit-video-downloader' },
                    { label: 'LinkedIn Downloader', to: '/linkedin-video-downloader' },
                    { label: 'Snapchat Downloader', to: '/snapchat-video-downloader' },
                    { label: 'Threads Downloader', to: '/threads-video-downloader' },
                    { label: 'Vimeo Downloader', to: '/vimeo-video-downloader' },
                    { label: 'Twitch Downloader', to: '/twitch-clip-downloader' },
                    { label: 'Dailymotion Downloader', to: '/dailymotion-video-downloader' },
                  ].map(({ label, to }) => (
                    <a
                      key={to}
                      href={to}
                      className="text-sm text-text-secondary hover:text-accent hover:underline transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                  {/* Music platforms */}
                  {[
                    { label: 'Spotify Downloader', to: '/spotify-downloader' },
                    { label: 'Apple Music Downloader', to: '/apple-music-downloader' },
                    { label: 'YouTube Music Downloader', to: '/youtube-music-downloader' },
                    { label: 'SoundCloud Downloader', to: '/soundcloud-downloader' },
                  ].map(({ label, to }) => (
                    <a
                      key={to}
                      href={to}
                      className="text-sm text-text-secondary hover:text-accent hover:underline transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary opacity-80">
                <p>© {new Date().getFullYear()} mediasaver. All rights reserved.</p>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <a href="/about" className="hover:text-accent hover:underline">About</a>
                  <span>•</span>
                  <a href="/privacy-policy" className="hover:text-accent hover:underline">Privacy Policy</a>
                  <span>•</span>
                  <a href="/terms-of-service" className="hover:text-accent hover:underline">Terms of Service</a>
                  <span>•</span>
                  <a href="/dmca" className="hover:text-accent hover:underline">DMCA</a>
                  <span>•</span>
                  <a href="/user-guide" className="hover:text-accent hover:underline">User Guide</a>
                  <span>•</span>
                  <a href="/contact" className="hover:text-accent hover:underline">Contact</a>
                  <span>•</span>
                  <a href="/feedback" className="hover:text-accent hover:underline">Feedback</a>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
