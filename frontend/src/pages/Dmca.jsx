import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Dmca = () => {
  return (
    <main className="flex-1 w-full bg-[#FAFAF8] py-8 sm:py-12 px-4">
      <SEO
        title="DMCA Copyright Policy - mediasaver"
        description="mediasaver DMCA and Copyright Compliance Policy. Learn how we handle copyright notices and protect intellectual property rights."
        canonicalPath="/dmca"
      />

      <style>{`
        .dmca-card {
          background-color: #ffffff !important;
          color: #1f2937 !important;
        }
        .dmca-card p, 
        .dmca-card li, 
        .dmca-card ol, 
        .dmca-card ul {
          color: #1f2937 !important;
          opacity: 1 !important;
        }
        .dmca-card h1, 
        .dmca-card h2, 
        .dmca-card h3, 
        .dmca-card strong {
          color: #111827 !important;
          opacity: 1 !important;
        }
      `}</style>

      <div className="dmca-card max-w-4xl mx-auto border border-[#E3E1DC] rounded-2xl p-6 sm:p-10 shadow-sm">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs sm:text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" style={{ color: '#0E7C7B' }} className="hover:underline font-semibold">Home</Link>
            </li>
            <li style={{ color: '#9ca3af' }}>/</li>
            <li style={{ color: '#111827' }} className="font-semibold" aria-current="page">DMCA Policy</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#111827' }}>
          DMCA Copyright Policy
        </h1>
        <p className="text-xs font-medium mb-8" style={{ color: '#4b5563' }}>
          Digital Millennium Copyright Act Notice &bull; Last Updated: September 2026
        </p>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>1. Compliance Commitment</h2>
            <p style={{ color: '#1f2937' }}>
              mediasaver respects the intellectual property rights of creators and copyright holders. In compliance with the Digital Millennium Copyright Act (17 U.S.C. &sect; 512), we respond promptly to valid notices of alleged infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>2. How Our Service Operates</h2>
            <p style={{ color: '#1f2937' }}>
              It is critical to note that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li style={{ color: '#1f2937' }}>mediasaver <strong style={{ color: '#111827' }}>does not host</strong>, upload, store, or broadcast any video or audio files on our servers.</li>
              <li style={{ color: '#1f2937' }}>All media files are streamed and fetched directly from public third-party content delivery networks (CDNs).</li>
              <li style={{ color: '#1f2937' }}>We do not crack DRM protections, circumvent encryption, or bypass password-protected feeds.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>3. Submitting a Notice of Infringement</h2>
            <p style={{ color: '#1f2937' }}>
              If you are a copyright owner or authorized agent and wish to request the blocking or blacklisting of specific URLs or domains from being processed through mediasaver, please send a written notice containing:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li style={{ color: '#1f2937' }}>Identification of the copyrighted work claimed to have been infringed.</li>
              <li style={{ color: '#1f2937' }}>The exact URLs on mediasaver or target content you request to block.</li>
              <li style={{ color: '#1f2937' }}>Your contact information (name, address, telephone number, and official email).</li>
              <li style={{ color: '#1f2937' }}>A statement that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
              <li style={{ color: '#1f2937' }}>A statement made under penalty of perjury that the information provided is accurate and that you are authorized to act on behalf of the owner.</li>
              <li style={{ color: '#1f2937' }}>Your physical or electronic signature.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>4. Designated Copyright Agent &amp; Turnaround</h2>
            <p style={{ color: '#1f2937' }}>
              Please submit your notice directly to our designated copyright contact:
            </p>
            <div className="p-5 my-4 bg-[#F5F5F3] border border-[#E3E1DC] rounded-xl text-sm space-y-2" style={{ color: '#111827' }}>
              <p><strong style={{ color: '#111827' }}>Designated Agent:</strong> mediasaver Legal &amp; Copyright Compliance</p>
              <p><strong style={{ color: '#111827' }}>Email:</strong> <a href="mailto:purushottamx.in@gmail.com?subject=DMCA%20Takedown%20Request" style={{ color: '#0E7C7B' }} className="hover:underline font-semibold font-mono">purushottamx.in@gmail.com</a></p>
              <p><strong style={{ color: '#111827' }}>Subject Line:</strong> DMCA Takedown Request - mediasaver</p>
              <p><strong style={{ color: '#111827' }}>Expected Turnaround:</strong> 24&ndash;48 business hours</p>
            </div>
            <p style={{ color: '#1f2937' }}>
              Upon receipt of a valid notice fulfilling all statutory requirements under 17 U.S.C. &sect; 512(c)(3), we will expeditiously block access to the reported URL(s) or disable extraction capabilities for the disputed asset.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Dmca;
