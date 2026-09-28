import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Globe, Heart } from 'lucide-react';

const About = () => {
  return (
    <main className="flex-1 w-full bg-[#FAFAF8] py-8 sm:py-12 px-4">
      <SEO
        title="About Us - mediasaver | Free Online Media Downloader"
        description="Learn more about mediasaver, our mission to provide fast, privacy-focused media downloading, and our commitment to user security."
        canonicalPath="/about"
      />

      <style>{`
        .legal-card {
          background-color: #ffffff !important;
          color: #1f2937 !important;
        }
        .legal-card p, 
        .legal-card li, 
        .legal-card ol, 
        .legal-card ul {
          color: #1f2937 !important;
          opacity: 1 !important;
        }
        .legal-card h1, 
        .legal-card h2, 
        .legal-card h3, 
        .legal-card strong {
          color: #111827 !important;
          opacity: 1 !important;
        }
      `}</style>

      <div className="legal-card max-w-4xl mx-auto border border-[#E3E1DC] rounded-2xl p-6 sm:p-10 shadow-sm">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs sm:text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" style={{ color: '#0E7C7B' }} className="hover:underline font-semibold">Home</Link>
            </li>
            <li style={{ color: '#9ca3af' }}>/</li>
            <li style={{ color: '#111827' }} className="font-semibold" aria-current="page">About Us</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: '#111827' }}>About mediasaver</h1>
        <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: '#1f2937' }}>
          mediasaver is a modern, web-based utility designed to help users download and backup public videos and audio from the internet. We believe accessing and saving public media for offline viewing, archiving, and educational purposes should be fast, simple, and free.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
          <div className="p-6 bg-[#F5F5F3] border border-[#E3E1DC] rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-[#0E7C7B]/10 text-[#0E7C7B] flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>High-Speed Extraction</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>
              Our optimized media engine parses streaming manifests to deliver high-resolution MP4 video and crystal-clear audio with minimal waiting.
            </p>
          </div>

          <div className="p-6 bg-[#F5F5F3] border border-[#E3E1DC] rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-[#0E7C7B]/10 text-[#0E7C7B] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>Privacy by Design</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>
              We do not require user accounts, passwords, or personal credentials. We do not permanently store downloaded media on our servers.
            </p>
          </div>

          <div className="p-6 bg-[#F5F5F3] border border-[#E3E1DC] rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-[#0E7C7B]/10 text-[#0E7C7B] flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>Universal Compatibility</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>
              Whether you are on Android, iOS, Windows, Mac, or Linux, mediasaver runs directly in your browser without requiring extra software or extensions.
            </p>
          </div>

          <div className="p-6 bg-[#F5F5F3] border border-[#E3E1DC] rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-[#0E7C7B]/10 text-[#0E7C7B] flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>Community &amp; Respect</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>
              We encourage responsible media consumption. Our service is built strictly for personal, fair-use, and educational archiving.
            </p>
          </div>
        </div>

        <div className="border-t border-[#E3E1DC] pt-8 text-sm space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>Questions or Suggestions?</h2>
          <p style={{ color: '#1f2937' }}>
            We are constantly refining mediasaver. If you have feedback, bug reports, or feature requests, visit our{' '}
            <Link to="/feedback" style={{ color: '#0E7C7B' }} className="hover:underline font-semibold">Feedback page</Link> or{' '}
            <Link to="/contact" style={{ color: '#0E7C7B' }} className="hover:underline font-semibold">Contact us</Link>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default About;
