import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <main className="flex-1 w-full bg-[#FAFAF8] py-8 sm:py-12 px-4">
      <SEO
        title="Privacy Policy - mediasaver"
        description="Read the mediasaver Privacy Policy to understand how we respect your privacy, avoid tracking personal data, and protect your security."
        canonicalPath="/privacy-policy"
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
            <li style={{ color: '#111827' }} className="font-semibold" aria-current="page">Privacy Policy</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#111827' }}>Privacy Policy</h1>
        <p className="text-xs font-medium mb-8" style={{ color: '#4b5563' }}>Last Updated: September 2026</p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>1. Overview</h2>
            <p style={{ color: '#1f2937' }}>
              mediasaver (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. We believe that downloading public media should not come at the cost of personal surveillance. This policy outlines what information is collected, how it is used, and how your privacy is protected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>2. Information We Do Not Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li style={{ color: '#1f2937' }}>We do not require user accounts, passwords, or personal login information.</li>
              <li style={{ color: '#1f2937' }}>We do not record, store, or catalogue the specific URLs or video titles you submit.</li>
              <li style={{ color: '#1f2937' }}>We do not store your downloaded audio or video files on our persistent servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>3. Information We Collect Automatically</h2>
            <p style={{ color: '#1f2937' }}>
              Like most web services, our servers automatically receive standard technical logs required for network routing, security, and rate limiting (such as IP addresses, browser user-agent, and general timestamps). These logs are rotated periodically and used exclusively to mitigate denial-of-service (DoS) attacks and abuse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>4. Analytics &amp; Cookies</h2>
            <p style={{ color: '#1f2937' }}>
              We may use privacy-compliant web analytics (such as Google Tag Manager / Google Analytics) to monitor aggregate traffic trends, bounce rates, and popular browser types. These cookies do not contain personally identifiable information (PII). You can disable cookies at any time via your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>5. Third-Party Platforms</h2>
            <p style={{ color: '#1f2937' }}>
              When you enter a media URL, our servers interact with public endpoints of third-party platforms (e.g., YouTube, Instagram, Reddit) on your behalf to obtain media streaming URLs. We are not responsible for the privacy practices or terms of those third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>6. Contact Information</h2>
            <p style={{ color: '#1f2937' }}>
              For any privacy-related questions, please reach out via our{' '}
              <Link to="/contact" style={{ color: '#0E7C7B' }} className="hover:underline font-semibold">Contact Page</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
