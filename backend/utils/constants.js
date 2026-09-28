import http from 'http';
import https from 'https';
import { URL } from 'url';

export const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
};

export const GOOGLEBOT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

export const LINKEDIN_CRAWLER_AGENTS = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
];

export const makeHeaders = (ua) => ({
  'User-Agent': ua,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
});

export const DUMMY_FORMAT = {
  format_id: 'best',
  ext: 'mp4',
  acodec: 'mp4a.40.2',
  vcodec: 'avc1.4d401e',
  resolution: 'best',
};

export const STANDARD_AUDIO_FORMATS = [
  { format_id: '320k', resolution: '320 kbps (Best)', ext: 'mp3', acodec: 'mp3', vcodec: 'none', hasVideo: false },
  { format_id: '256k', resolution: '256 kbps (High)', ext: 'mp3', acodec: 'mp3', vcodec: 'none', hasVideo: false },
  { format_id: '192k', resolution: '192 kbps (Standard)', ext: 'mp3', acodec: 'mp3', vcodec: 'none', hasVideo: false },
  { format_id: '128k', resolution: '128 kbps (Compact)', ext: 'mp3', acodec: 'mp3', vcodec: 'none', hasVideo: false },
];

export const fetchContentLength = async (url, headers = {}) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers,
      signal: AbortSignal.timeout(3000),
    });
    const len = res.headers.get('content-length');
    if (len) {
      const parsed = parseInt(len, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {}
  return null;
};

export const fetchHttpMediaStream = (rawUrl, headers = REQUEST_HEADERS, timeoutMs = 30000) => {
  return new Promise((resolve, reject) => {
    const isHttps = rawUrl.startsWith('https');
    const client = isHttps ? https : http;
    const req = client.get(rawUrl, { headers, timeout: timeoutMs }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectIsHttps = res.headers.location.startsWith('https');
        const redirectClient = redirectIsHttps ? https : http;
        const req2 = redirectClient.get(res.headers.location, { headers, timeout: timeoutMs }, (res2) => {
          resolve(res2);
        }).on('error', reject).on('timeout', () => req2.destroy(new Error('Media stream timeout')));
      } else {
        resolve(res);
      }
    }).on('error', reject).on('timeout', () => req.destroy(new Error('Media stream timeout')));
  });
};

export const fetchCdnAudioStream = async (cdnUrl, referer = 'https://frame.y2meta-uk.com/') => {
  const stream = await new Promise((resolve, reject) => {
    const parsed = new URL(cdnUrl);
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.get(
      cdnUrl,
      {
        headers: {
          'User-Agent': REQUEST_HEADERS['User-Agent'],
          Referer: referer,
          Accept: '*/*',
        },
        timeout: 30000,
      },
      (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          reject(new Error(`CDN stream HTTP ${res.statusCode}`));
        }
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('CDN stream connection timeout')));
  });
  stream.isMp3Ready = true;
  return stream;
};


