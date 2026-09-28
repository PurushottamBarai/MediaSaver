import React from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

const CONTACT_TITLE = 'Contact Us - mediasaver';
const CONTACT_DESCRIPTION = 'Have questions or need help? Contact us via purushottamx.in@gmail.com.';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col w-full bg-white">
      <SEO
        title={CONTACT_TITLE}
        description={CONTACT_DESCRIPTION}
        canonicalPath="/contact"
      />

      {/* Top Banner with site greenish theme and bottom curve */}
      <div className="relative w-full bg-gradient-to-r from-[#0a5f5e] via-[#0E7C7B] to-[#129493] py-20 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wide">
          {t('contactPageTitle', 'Contact')}
        </h1>

        {/* Bottom subtle wave curve */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg
            className="relative block w-full h-5 sm:h-6 text-white fill-current"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,0 C200,60 400,20 600,50 C800,80 1000,30 1200,45 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </div>

      {/* Simple content area matching reference image */}
      <div className="w-full max-w-3xl mx-auto px-6 py-14 sm:py-16 text-gray-800 text-base sm:text-lg leading-relaxed">
        <p className="mb-6 text-gray-800">
          {t('contactHelpText', 'Have questions or need help with your purchase or our services? Use email:')}{' '}
          <a
            href="mailto:purushottamx.in@gmail.com"
            className="text-[#0E7C7B] hover:underline font-medium"
          >
            purushottamx.in@gmail.com
          </a>
        </p>

        <p className="text-gray-800 mb-8">
          {t('contactReachOutText', 'to reach out and we will be in touch with you as quickly as possible. For specific issues, make use of the following POCs for faster redressal.')}
        </p>

        {/* DMCA / Copyright Dedicated Contact Box */}
        <div className="border border-border/80 rounded-xl p-6 bg-slate-50/70 text-sm space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🛡️</span> DMCA, Copyright &amp; Content Takedown Notices
          </h2>
          <p className="text-gray-600 leading-relaxed">
            If you are a copyright owner or legal representative seeking to request the removal or blocking of specific content URLs, please submit your formal notice to our designated agent:
          </p>
          <div className="text-xs sm:text-sm font-mono bg-white border border-border p-3 rounded-lg text-gray-800 space-y-1">
            <p><strong>Email:</strong> <a href="mailto:purushottamx.in@gmail.com?subject=DMCA%20Takedown%20Notice" className="text-[#0E7C7B] hover:underline font-semibold">purushottamx.in@gmail.com</a></p>
            <p><strong>Subject:</strong> [DMCA Notice] Request for URL Block</p>
            <p><strong>Response SLA:</strong> 24–48 business hours</p>
          </div>
          <p className="text-xs text-gray-500">
            For statutory requirements and filing details, please review our full{' '}
            <a href="/dmca" className="text-[#0E7C7B] font-medium hover:underline">DMCA Policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
