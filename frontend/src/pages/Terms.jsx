import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <main className="flex-1 w-full bg-[#FAFAF8] py-8 sm:py-12 px-4">
      <SEO
        title="Terms of Service - mediasaver"
        description="Review the mediasaver Terms of Service governing your use of our online media downloading tools, user conduct, and copyright compliance."
        canonicalPath="/terms-of-service"
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
            <li style={{ color: '#111827' }} className="font-semibold" aria-current="page">Terms of Service</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#111827' }}>Terms of Service</h1>
        <p className="text-xs font-medium mb-8" style={{ color: '#4b5563' }}>Last Updated: September 2026</p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>1. Acceptance of Terms</h2>
            <p style={{ color: '#1f2937' }}>
              By accessing or using mediasaver (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>2. Permitted Use</h2>
            <p style={{ color: '#1f2937' }}>
              mediasaver is provided strictly for personal, non-commercial, and fair-use educational archiving. You agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li style={{ color: '#1f2937' }}>You will only download content you own, have licensed, or have explicit permission to access from the copyright holder.</li>
              <li style={{ color: '#1f2937' }}>You will not use the Service to redistribute, sell, or commercially exploit copyrighted material.</li>
              <li style={{ color: '#1f2937' }}>You will not use automated scrapers, bots, or scripts that overload or disrupt service performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>3. Intellectual Property Rights</h2>
            <p style={{ color: '#1f2937' }}>
              mediasaver does not host, store, or license any media files. All rights, titles, and trademarks of third-party platforms (e.g., YouTube, Instagram, Facebook, TikTok, Spotify) belong to their respective owners. Mention of these platforms is for compatibility identification purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>4. Disclaimer of Warranties</h2>
            <p style={{ color: '#1f2937' }}>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee uninterrupted availability, error-free operation, or compatibility with every media stream format.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>5. Limitation of Liability</h2>
            <p style={{ color: '#1f2937' }}>
              To the fullest extent permitted by law, mediasaver and its maintainers shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>6. DMCA &amp; Infringement</h2>
            <p style={{ color: '#1f2937' }}>
              If you are a copyright owner and believe your copyrighted work is being infringed, please review our{' '}
              <Link to="/dmca" style={{ color: '#0E7C7B' }} className="hover:underline font-semibold">DMCA Policy</Link> for notification instructions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Terms;
