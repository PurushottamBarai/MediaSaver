import React, { useState } from "react";

const transcript = [
  { time: "0:00", text: "mediasaver is a versatile online tool that allows you to download videos from any social media platform. It extracts audio/video files directly from URLs, quickly and efficiently. Visit mediasaver-57yu.onrender.com" },
  { time: "0:16", text: "Input the URL of the video you want to download from a supported social media site." },
  { time: "0:22", text: "Choose the desired format of the file to download, then click extract, wait for moments." },
  { time: "0:28", text: "Once extraction completes, the video title and details become available for review." },
  { time: "0:34", text: "Choose the available video quality option to determine the download file size and resolution." },
  { time: "0:40", text: "Click download to download the file." },
  { time: "0:43", text: "Once the download is complete, the file will be available to use locally." },
  { time: "0:48", text: "Click here to explore the supported platforms." },
  { time: "0:52", text: "This free tool supports various platforms and ensures legal, personal, and educational use." },
  { time: "0:57", text: "Thank you!" },
];

export default function VideoGuide() {
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="video-guide" className="w-full max-w-3xl mx-auto my-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-text-primary text-center sm:text-left">
        How to Download Videos with mediasaver | Step-by-Step Guide
      </h2>

      <div className="relative w-full rounded-xl overflow-hidden shadow-md bg-surface border border-border aspect-video">
        {isPlaying ? (
          <iframe
            src="https://www.youtube.com/embed/ONIXO2fe948?autoplay=1"
            title="How to Download Videos with mediasaver | Step-by-Step Guide"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-xl"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group relative w-full h-full cursor-pointer flex items-center justify-center bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Play Video Tutorial"
          >
            <img
              src="https://img.youtube.com/vi/ONIXO2fe948/maxresdefault.jpg"
              alt="Video tutorial thumbnail for mediasaver"
              loading="lazy"
              width="1280"
              height="720"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-accent text-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 ml-1 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="mt-4 text-sm font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer flex items-center gap-1.5"
        aria-expanded={showTranscript}
      >
        {showTranscript ? "Hide transcript" : "Show video transcript"}
      </button>

      {showTranscript && (
        <div className="mt-3 space-y-2 text-sm text-text-secondary border-l-2 border-border pl-4 py-1">
          {transcript.map((line, i) => (
            <p key={i} className="leading-relaxed">
              <span className="font-mono text-text-secondary/70 mr-2 font-medium">{line.time}</span>
              {line.text}
            </p>
          ))}
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: "How to Download Videos with mediasaver | Step-by-Step Guide",
            description:
              "Step-by-step guide showing how to use mediasaver to download videos and audio from any social media platform.",
            thumbnailUrl:
              "https://img.youtube.com/vi/ONIXO2fe948/maxresdefault.jpg",
            uploadDate: "2026-09-17T00:00:00+05:30",
            embedUrl: "https://www.youtube.com/embed/ONIXO2fe948",
          }),
        }}
      />
    </section>
  );
}
