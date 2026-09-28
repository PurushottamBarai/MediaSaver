import { videoInfoCache } from '../utils/cache.js';
import { STANDARD_AUDIO_FORMATS } from '../utils/constants.js';
import * as ytdlpService from './ytdlpService.js';

/**
 * Resolves SoundCloud short links (on.soundcloud.com/...) to full soundcloud.com URLs
 */
export const resolveSoundCloudUrl = async (urlString) => {
  if (!urlString || typeof urlString !== 'string') return urlString;
  if (!urlString.includes('on.soundcloud.com/')) return urlString;

  try {
    const res = await fetch(urlString, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    });

    const location = res.headers.get('location');
    if (location) {
      process.stdout.write(`[soundcloudService] Resolved ${urlString} → ${location}\n`);
      return location;
    }
  } catch (err) {
    process.stderr.write(`[soundcloudService] Failed to resolve short link: ${err.message}\n`);
  }

  return urlString;
};

/**
 * Fetches track or playlist metadata from SoundCloud
 */
export const fetchSoundCloudInfo = async (rawUrl) => {
  const resolvedUrl = await resolveSoundCloudUrl(rawUrl);

  const cached = videoInfoCache.get(resolvedUrl) || videoInfoCache.get(rawUrl);
  if (cached) return cached;

  const isSet = resolvedUrl.includes('/sets/');
  if (isSet) {
    const ytdlpExec = ytdlpService.getYtdlpInstance();
    const playlistData = await ytdlpExec(resolvedUrl, {
      dumpSingleJson: true,
      flatPlaylist: true,
      playlistEnd: 100,
      noWarnings: true,
    });

    const entries = playlistData.entries || [];
    if (!entries.length) {
      throw new Error('No tracks found in SoundCloud playlist.');
    }

    const tracks = entries.map((e, idx) => ({
      index: idx + 1,
      id: e.id || `sc_${idx + 1}`,
      title: e.title || `Track ${idx + 1}`,
      artists: e.uploader || e.channel || '',
      duration: e.duration || null,
      previewUrl: null,
      downloadUrl: e.url || resolvedUrl,
      searchQuery: `${e.uploader || ''} ${e.title || ''}`.trim(),
    }));

    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const thumbnail =
      playlistData.thumbnails?.[0]?.url ||
      (entries[0]?.thumbnail ? entries[0].thumbnail : null);

    const result = {
      title: playlistData.title || 'SoundCloud Playlist',
      thumbnail,
      duration: totalDuration > 0 ? totalDuration : null,
      platform: 'soundcloud',
      spotifyType: 'playlist',
      isCollection: true,
      trackCount: tracks.length,
      tracks,
      formats: STANDARD_AUDIO_FORMATS,
      audioAvailable: true,
    };

    videoInfoCache.set(rawUrl, result);
    videoInfoCache.set(resolvedUrl, result);
    return result;
  }

  let oembed = null;
  try {
    const oembedRes = await fetch(
      `https://soundcloud.com/oembed?url=${encodeURIComponent(resolvedUrl)}&format=json`,
      {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      }
    );
    if (oembedRes.ok) {
      oembed = await oembedRes.json();
    }
  } catch {}

  let ytdlpInfo = null;
  try {
    ytdlpInfo = await ytdlpService.fetchVideoInfo(resolvedUrl);
  } catch (err) {
    process.stderr.write(`[soundcloudService] yt-dlp info failed: ${err.message}\n`);
  }

  const rawTitle = ytdlpInfo?.title || oembed?.title || 'SoundCloud Audio';
  const authorName = ytdlpInfo?.uploader || oembed?.author_name || '';
  const cleanTitle = rawTitle.replace(/\s+by\s+.*$/i, '').trim();
  const displayTitle = authorName && !cleanTitle.toLowerCase().includes(authorName.toLowerCase())
    ? `${cleanTitle} - ${authorName}`
    : cleanTitle;

  const thumbnail =
    ytdlpInfo?.thumbnail ||
    oembed?.thumbnail_url ||
    null;

  const result = {
    title: displayTitle,
    thumbnail,
    duration: ytdlpInfo?.duration ? Math.round(ytdlpInfo.duration) : null,
    platform: 'soundcloud',
    spotifyType: 'track',
    trackName: cleanTitle,
    artists: authorName,
    formats: STANDARD_AUDIO_FORMATS,
    audioAvailable: true,
    searchQuery: `${authorName} ${cleanTitle}`.trim(),
  };

  videoInfoCache.set(rawUrl, result);
  videoInfoCache.set(resolvedUrl, result);
  return result;
};

/**
 * Downloads a SoundCloud track and returns media stream
 */
export const downloadSoundCloudTrack = async (url, formatId, type, bitrate) => {
  const resolvedUrl = await resolveSoundCloudUrl(url);
  process.stdout.write(`[soundcloudService] Downloading track from: ${resolvedUrl}\n`);
  return ytdlpService.downloadVideo(resolvedUrl, 'bestaudio/best', 'audio');
};
