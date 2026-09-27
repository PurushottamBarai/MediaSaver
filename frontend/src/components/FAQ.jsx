import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const getHomeFaqs = (t) => [
  {
    question: t('faq1Q', 'Is mediasaver free to use?'),
    answer: t('faq1A', 'Yes. mediasaver is completely free — just paste a URL and download your video.')
  },
  {
    question: t('faq2Q', 'Do I need to create an account?'),
    answer: t('faq2A', "No. There's no sign-up required. Paste your link and download instantly.")
  },
  {
    question: t('faq3Q', 'Is it legal to download videos with mediasaver?'),
    answer: t('faq3A', "You should only download videos you own, have permission to use, or that are shared under a license allowing reuse. Downloading copyrighted content without permission may violate the original platform's terms of service.")
  },
  {
    question: t('faq4Q', 'What video quality can I download?'),
    answer: t('faq4A', 'Quality depends on what the original platform provides — most videos are available in the highest resolution offered by the source.')
  },
  {
    question: t('faq5Q', 'Can I download videos on my phone?'),
    answer: t('faq5A', 'Yes. mediasaver works on any device with a browser — mobile, tablet, or desktop.')
  },
  {
    question: t('faq6Q', "Why isn't a video downloading?"),
    answer: t('faq6A', 'Some videos may be private, age-restricted, or removed by the uploader, which can prevent downloading. Try a different public video link, or check that the URL was copied correctly.')
  },
  {
    question: t('faq7Q', 'Does mediasaver add a watermark to downloaded videos?'),
    answer: t('faq7A', 'No. Videos are downloaded as close to the original as the source platform provides — no added watermark.')
  },
  {
    question: t('faq8Q', 'Can I download music from Spotify, Apple Music, or SoundCloud?'),
    answer: t('faq8A', 'Yes! mediasaver supports music downloads from Spotify, Apple Music, YouTube Music, and SoundCloud. Paste any track, album, or playlist link to save high-quality MP3 files.')
  }
];

export const homeFaqs = [
  {
    question: 'Is mediasaver free to use?',
    answer: 'Yes. mediasaver is completely free — just paste a URL and download your video.'
  },
  {
    question: 'Do I need to create an account?',
    answer: "No. There's no sign-up required. Paste your link and download instantly."
  },
  {
    question: 'Is it legal to download videos with mediasaver?',
    answer: "You should only download videos you own, have permission to use, or that are shared under a license allowing reuse. Downloading copyrighted content without permission may violate the original platform's terms of service."
  },
  {
    question: 'What video quality can I download?',
    answer: 'Quality depends on what the original platform provides — most videos are available in the highest resolution offered by the source.'
  },
  {
    question: 'Can I download videos on my phone?',
    answer: 'Yes. mediasaver works on any device with a browser — mobile, tablet, or desktop.'
  },
  {
    question: "Why isn't a video downloading?",
    answer: 'Some videos may be private, age-restricted, or removed by the uploader, which can prevent downloading. Try a different public video link, or check that the URL was copied correctly.'
  },
  {
    question: 'Does mediasaver add a watermark to downloaded videos?',
    answer: 'No. Videos are downloaded as close to the original as the source platform provides — no added watermark.'
  },
  {
    question: 'Can I download music from Spotify, Apple Music, or SoundCloud?',
    answer: 'Yes! mediasaver supports music downloads from Spotify, Apple Music, YouTube Music, and SoundCloud. Paste any track, album, or playlist link to save high-quality MP3 files.'
  }
];

const FAQ = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = getHomeFaqs(t);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full max-w-4xl mx-auto py-12 px-4 border-t border-border mb-8">
      <h2 className="text-3xl font-bold text-text-primary text-center mb-10">{t('faqTitle', 'Frequently Asked Questions')}</h2>
      
      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => {
          const btnId = `faq-btn-${index}`;
          const panelId = `faq-panel-${index}`;
          const isOpen = openIndex === index;

          return (
            <div 
              key={faq.question} 
              className="border border-border rounded-lg bg-surface overflow-hidden transition-all"
            >
              <button
                id={btnId}
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:bg-base/50"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="font-semibold text-text-primary">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              <div 
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className={`px-5 text-text-secondary text-sm overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'pb-5 max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
