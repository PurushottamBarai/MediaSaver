import http from 'http';
import https from 'https';
import crypto from 'crypto';
import { URL } from 'url';
import { videoInfoCache } from '../utils/cache.js';

// --- Vidssave AES Decryptor (Tier 1 Engine) ---
const VIDSSAVE_KEYS = ['4c9b7d2e'.repeat(3) + '4c9b7d21', 'rz18efAXUbdiaO7k'];

const decryptVidssave = (ciphertextB64) => {
  if (!ciphertextB64 || typeof ciphertextB64 !== 'string') return null;
  const ciphertextBuf = Buffer.from(ciphertextB64, 'base64');
  for (const k of VIDSSAVE_KEYS) {
    try {
      const keyBuf = Buffer.from(k, 'utf8');
      const ivBuf = Buffer.from(k.slice(0, 16), 'utf8');
      const decipher = crypto.createDecipheriv(
        keyBuf.length === 32 ? 'aes-256-cbc' : 'aes-128-cbc',
        keyBuf,
        ivBuf
      );
      decipher.setAutoPadding(false);
      const decrypted = Buffer.concat([decipher.update(ciphertextBuf), decipher.final()]);
      let end = decrypted.length;
      while (end > 0 && decrypted[end - 1] === 0) end--;
      const str = decrypted.slice(0, end).toString('utf8');
      try {
        return JSON.parse(str);
      } catch {
        return str;
      }
    } catch {}
  }
  return null;
};

export const extractYouTubeId = (urlString) => {
  if (!urlString || typeof urlString !== 'string') return null;
  const match = urlString.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{10,15})/i
  );
  if (match && match[1]) {
    return match[1].split('?')[0].split('&')[0];
  }
  return null;
};

// --- Tier 1: Vidssave Extractor & Stream Engine ---
export const fetchVidssaveInfo = async (videoId) => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch('https://api.vidssave.com/api/contentsite_api/media/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Origin': 'https://pk.vidssave.com',
      'Referer': 'https://pk.vidssave.com/',
    },
    body: new URLSearchParams({
      hostname: 'pk.vidssave.com',
      auth: '4c9b7d21',
      domain: 'api-ak.vidssave.com',
      origin: 'source',
      link: url,
    }).toString(),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return null;
  const json = await res.json();
  if (!json.data) return null;

  const decrypted = typeof json.data === 'string' ? decryptVidssave(json.data) : json.data;
  if (!decrypted || !decrypted.title) return null;

  return decrypted;
};

export const fetchVidssaveStream = async (videoId, quality = '720', type = 'video', cachedFormats = null) => {
  try {
    let resourceContent = null;

    if (Array.isArray(cachedFormats) && cachedFormats.length > 0) {
      const qLower = String(quality).toLowerCase().replace('p', '');
      const matched = cachedFormats.find((f) => {
        if (type === 'audio' || type === 'mp3') {
          return f.ext === 'mp3' || !f.hasVideo;
        }
        return f.resolution && f.resolution.toLowerCase().includes(qLower);
      });
      if (matched && matched.resourceContent) {
        resourceContent = matched.resourceContent;
      }
    }

    if (!resourceContent) {
      const info = await fetchVidssaveInfo(videoId);
      if (!info || !info.resources || info.resources.length === 0) return null;

      const resources = info.resources;
      let target = null;

      if (type === 'audio' || type === 'mp3') {
        target = resources.find((r) => r.type === 'audio') || resources[0];
      } else {
        const qUpper = String(quality).toUpperCase();
        const qWithP = qUpper.endsWith('P') ? qUpper : `${qUpper}P`;
        target = resources.find((r) => r.type === 'video' && r.quality === qWithP);
        if (!target) {
          target = resources.find((r) => r.type === 'video' && (r.quality === '720P' || r.quality === '1080P' || r.quality === '360P'))
            || resources.find((r) => r.type === 'video')
            || resources[0];
        }
      }
      resourceContent = target?.resource_content;
    }

    if (!resourceContent) return null;

    // Request download task
    const dlRes = await fetch('https://api.vidssave.com/api/contentsite_api/media/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Origin': 'https://pk.vidssave.com',
        'Referer': 'https://pk.vidssave.com/',
      },
      body: new URLSearchParams({
        hostname: 'pk.vidssave.com',
        auth: '4c9b7d21',
        domain: 'api-ak.vidssave.com',
        request: resourceContent,
        no_encrypt: '1',
      }).toString(),
      signal: AbortSignal.timeout(15000),
    });

    if (!dlRes.ok) return null;
    const dlJson = await dlRes.json();
    const dlData = dlJson.data ? decryptVidssave(dlJson.data) : null;
    if (!dlData || !dlData.task_id) return null;

    const taskId = dlData.task_id;

    // Poll for download link (max 15 iterations * 1000ms = 15s)
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const qRes = await fetch('https://api.vidssave.com/api/contentsite_api/media/download_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Origin': 'https://pk.vidssave.com',
          'Referer': 'https://pk.vidssave.com/',
        },
        body: new URLSearchParams({
          hostname: 'pk.vidssave.com',
          auth: '4c9b7d21',
          domain: 'api-ak.vidssave.com',
          download_domain: 'vidssave.com',
          origin: 'content_site',
          task_id: taskId,
        }).toString(),
        signal: AbortSignal.timeout(5000),
      });

      if (qRes.ok) {
        const qText = await qRes.text();
        const dataMatch = qText.match(/data:\s*([^\n]+)/);
        if (dataMatch) {
          try {
            const payload = JSON.parse(dataMatch[1]);
            const qDec = payload.data ? decryptVidssave(payload.data) : payload;
            if (qDec && (qDec.download_link || qDec.download_url || qDec.url)) {
              return qDec.download_link || qDec.download_url || qDec.url;
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    process.stderr.write(`[youtubeService] Tier 1 vidssave error: ${err.message}\n`);
  }
  return null;
};

// --- Tier 2: Y2Mate Direct Tunnel Streaming Engine (cnv.cx API) ---
export const fetchY2MateStream = async (videoId, quality = '720', format = 'mp4') => {
  try {
    const keyRes = await fetch(`https://cnv.cx/v2/sanity/key?id=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://frame.y2meta-uk.com/',
        'Origin': 'https://frame.y2meta-uk.com',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!keyRes.ok) return null;
    const { key } = await keyRes.json();
    if (!key) return null;

    const params = new URLSearchParams({
      link: `https://youtu.be/${videoId}`,
      format: format === 'audio' || format === 'mp3' ? 'mp3' : 'mp4',
      audioBitrate: '128',
      videoQuality: quality || '720',
      filenameStyle: 'pretty',
      vCodec: 'h264',
    });

    const convRes = await fetch('https://cnv.cx/v2/converter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'key': key,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://frame.y2meta-uk.com/',
        'Origin': 'https://frame.y2meta-uk.com',
        'accept': '*/*',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });

    if (!convRes.ok) return null;
    const data = await convRes.json();
    if (data && data.url) {
      return data.url;
    }
  } catch (err) {
    process.stderr.write(`[youtubeService] Tier 2 Y2Mate engine error: ${err.message}\n`);
  }
  return null;
};

// Stream pipe with redirect support
const getStreamWithRedirects = (streamUrl, maxRedirects = 5) => {
  return new Promise((resolve, reject) => {
    const parsed = new URL(streamUrl);
    const client = parsed.protocol === 'http:' ? http : https;

    const req = client.get(
      streamUrl,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive',
        },
        timeout: 30000,
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          maxRedirects > 0
        ) {
          resolve(getStreamWithRedirects(res.headers.location, maxRedirects - 1));
        } else if (res.statusCode >= 400) {
          reject(new Error(`Stream HTTP Error ${res.statusCode}`));
        } else {
          resolve(res);
        }
      }
    );

    req.on('error', reject);
    req.on('timeout', () =>
      req.destroy(new Error('Connection timed out while downloading video stream.'))
    );
  });
};

const formatVidssaveResources = (resources, dur) => {
  if (!Array.isArray(resources) || resources.length === 0) return [];
  const itagMap = {
    '1080P': '137',
    '720P': '22',
    '480P': '135',
    '360P': '18',
    '240P': '133',
    '144P': '160',
  };

  const parsed = [];
  for (const r of resources) {
    const q = r.quality || '';
    const isVideo = r.type === 'video';
    const isAudio = r.type === 'audio';

    parsed.push({
      format_id: itagMap[q] || (isAudio ? '140' : String(r.resource_id || '22')),
      ext: (r.format || (isAudio ? 'mp3' : 'mp4')).toLowerCase(),
      resolution: isAudio ? 'Audio (128kbps)' : (q.toLowerCase() || '720p'),
      vcodec: isVideo ? 'h264' : 'none',
      acodec: 'mp4a.40.2',
      filesize: r.size ? parseInt(r.size, 10) : dur ? Math.round((2000 * 1000 * dur) / 8) : null,
      hasVideo: isVideo,
      hasAudio: true,
      resourceContent: r.resource_content || null,
    });
  }
  return parsed;
};

// --- Video Metadata Fetcher ---
export const fetchVideoInfo = async (url) => {
  const cached = videoInfoCache.get(url);
  if (cached && cached.duration) {
    return cached;
  }

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL.');
  }

  let title = null;
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let duration = null;
  let formats = [];

  // Tier 1: Extract full info & formats from pk.vidssave.com
  try {
    const vidssaveData = await fetchVidssaveInfo(videoId);
    if (vidssaveData) {
      if (vidssaveData.title) title = vidssaveData.title;
      if (vidssaveData.thumbnail) thumbnail = vidssaveData.thumbnail;
      if (vidssaveData.duration) duration = parseInt(vidssaveData.duration, 10);
      if (Array.isArray(vidssaveData.resources) && vidssaveData.resources.length > 0) {
        formats = formatVidssaveResources(vidssaveData.resources, duration);
      }
    }
  } catch (err) {
    process.stderr.write(`[youtubeService] Vidssave info extraction fallback: ${err.message}\n`);
  }

  // Tier 3: oEmbed official YouTube fallback if title or thumbnail missing
  if (!title || !thumbnail) {
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        {
          signal: AbortSignal.timeout(3500),
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        }
      );
      if (oembedRes.ok) {
        const d = await oembedRes.json();
        if (d.title && !title) title = d.title;
        if (d.thumbnail_url && !thumbnail) thumbnail = d.thumbnail_url;
      }
    } catch {}
  }

  // Resilient fallback for duration from page headers if still missing
  if (!duration) {
    try {
      const pRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(2500),
      });
      if (pRes.ok) {
        const html = await pRes.text();
        const secMatch = html.match(/"lengthSeconds":"(\d+)"/);
        if (secMatch) duration = parseInt(secMatch[1], 10);
      }
    } catch {}
  }

  // Static standard format options if formats couldn't be loaded dynamically
  if (formats.length === 0) {
    const dur = duration && duration > 0 ? duration : null;
    formats = [
      {
        format_id: '137',
        ext: 'mp4',
        resolution: '1080p',
        width: 1920,
        height: 1080,
        vcodec: 'h264',
        acodec: 'mp4a',
        hasVideo: true,
        filesize: dur ? Math.round((4128 * 1000 * dur) / 8) : null,
      },
      {
        format_id: '22',
        ext: 'mp4',
        resolution: '720p',
        width: 1280,
        height: 720,
        vcodec: 'h264',
        acodec: 'mp4a',
        hasVideo: true,
        filesize: dur ? Math.round((2328 * 1000 * dur) / 8) : null,
      },
      {
        format_id: '135',
        ext: 'mp4',
        resolution: '480p',
        width: 854,
        height: 480,
        vcodec: 'h264',
        acodec: 'mp4a',
        hasVideo: true,
        filesize: dur ? Math.round((1328 * 1000 * dur) / 8) : null,
      },
      {
        format_id: '18',
        ext: 'mp4',
        resolution: '360p',
        width: 640,
        height: 360,
        vcodec: 'h264',
        acodec: 'mp4a',
        hasVideo: true,
        filesize: dur ? Math.round((778 * 1000 * dur) / 8) : null,
      },
    ];
  }

  if (title) {
    const result = {
      title,
      thumbnail,
      duration,
      videoId,
      formats,
      embedDownloadUrl: `https://v2.y2jar.cc/?id=${videoId}&appearance=dark`,
      y2mateUrl: `https://v38.www-y2mate.com/`,
      isEmbedFallback: true,
    };

    videoInfoCache.set(url, result);
    return result;
  }

  throw new Error('We are unable to fulfill the request for YouTube right now. Please retry after some time, or try our other supported platforms.');
};

const resolveQualityFromFormat = (fmt) => {
  if (!fmt) return null;
  const h = fmt.height || (fmt.resolution?.match(/(\d+)x(\d+)/)?.[2]) || (fmt.resolution?.match(/(\d+)p/i)?.[1]);
  const numH = parseInt(h, 10);
  if (numH >= 1080) return '1080';
  if (numH >= 720) return '720';
  if (numH >= 480) return '480';
  if (numH >= 360) return '360';
  if (numH >= 240) return '240';
  if (numH >= 144) return '144';
  return null;
};

const mapFormatIdToQuality = (formatId, cachedFormats = []) => {
  if (!formatId || formatId === 'best') {
    const topVideo = (cachedFormats || []).find((f) => f.vcodec !== 'none' || f.hasVideo);
    if (topVideo) {
      const q = resolveQualityFromFormat(topVideo);
      if (q) return q;
    }
    return '720';
  }

  const itagMap = {
    '137': '1080', '248': '1080', '399': '1080',
    '22': '720', '136': '720', '247': '720', '398': '720',
    '135': '480', '244': '480', '397': '480',
    '18': '360', '134': '360', '243': '360', '396': '360',
    '133': '240', '242': '240',
    '160': '144',
  };
  if (itagMap[String(formatId)]) {
    return itagMap[String(formatId)];
  }

  const matched = (cachedFormats || []).find(
    (f) => String(f.format_id || f.formatId) === String(formatId)
  );
  if (matched) {
    const q = resolveQualityFromFormat(matched);
    if (q) return q;
  }

  const str = String(formatId);
  if (str.includes('1080')) return '1080';
  if (str.includes('720')) return '720';
  if (str.includes('480')) return '480';
  if (str.includes('360')) return '360';
  if (str.includes('240')) return '240';
  if (str.includes('144')) return '144';

  return '720';
};

// --- Main Downloader Flow ---
export const downloadVideo = async (url, formatId, type) => {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL.');
  }

  const cached = videoInfoCache.get(url);
  const targetQuality = mapFormatIdToQuality(formatId, cached?.formats);

  // 1. Tier 1: Vidssave Engine (pk.vidssave.com)
  try {
    process.stdout.write(`[youtubeService] Tier 1: Requesting Vidssave stream for ${videoId} (${targetQuality}p, type: ${type || 'video'})\n`);
    const vidssaveStreamUrl = await fetchVidssaveStream(videoId, targetQuality, type, cached?.formats);
    if (vidssaveStreamUrl) {
      process.stdout.write(`[youtubeService] Tier 1 Vidssave stream URL obtained. Connecting...\n`);
      return await getStreamWithRedirects(vidssaveStreamUrl);
    }
  } catch (err) {
    process.stdout.write(`[youtubeService] Tier 1 Vidssave failed: ${err.message}\n`);
  }

  // 2. Tier 2: Y2Mate Direct Tunnel Streaming Engine (cnv.cx API)
  try {
    process.stdout.write(`[youtubeService] Tier 2: Requesting Y2Mate stream for ${videoId} with quality ${targetQuality}\n`);
    let y2mateStreamUrl = await fetchY2MateStream(videoId, targetQuality, type);

    if (!y2mateStreamUrl && targetQuality !== '720') {
      process.stdout.write(`[youtubeService] Quality ${targetQuality} unavailable on Y2Mate for ${videoId}, falling back to 720\n`);
      y2mateStreamUrl = await fetchY2MateStream(videoId, '720', type);
    }

    if (y2mateStreamUrl) {
      return new Promise((resolve, reject) => {
        const parsed = new URL(y2mateStreamUrl);
        const client = parsed.protocol === 'http:' ? http : https;
        const req = client.get(
          y2mateStreamUrl,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
              'Referer': 'https://frame.y2meta-uk.com/',
              'Accept': '*/*',
            },
            timeout: 30000,
          },
          (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const contentLength = res.headers['content-length'];
              process.stdout.write(`[youtubeService] Tier 2 Y2Mate stream connected (quality: ${targetQuality}, size: ${contentLength ? `${Math.round(contentLength / 1048576)} MB` : 'unknown'})\n`);
              resolve(res);
            } else {
              reject(new Error(`Tier 2 Y2Mate stream failed with status ${res.statusCode}`));
            }
          }
        );
        req.on('error', reject);
        req.on('timeout', () => req.destroy(new Error('Tier 2 Y2Mate stream connection timeout')));
      });
    }
  } catch (err) {
    process.stdout.write(`[youtubeService] Tier 2 Y2Mate stream failed: ${err.message}\n`);
  }

  // If all failed, throw user-friendly error
  throw new Error('We are unable to fulfill the request for YouTube right now. Please retry after some time, or try our other supported platforms.');
};
