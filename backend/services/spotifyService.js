import { URL } from 'url';
import { videoInfoCache } from '../utils/cache.js';
import { STANDARD_AUDIO_FORMATS } from '../utils/constants.js';
import { downloadAudioBySearch } from '../utils/audioHelper.js';

const SPOTIFY_REGEX = /(?:open\.spotify\.com\/|spotify:)(track|playlist|album|artist)[:/]([a-zA-Z0-9]+)/i;

export const parseSpotifyUrl = (urlString) => {
  if (!urlString || typeof urlString !== 'string') return null;
  const match = urlString.match(SPOTIFY_REGEX);
  if (match) {
    return {
      type: match[1].toLowerCase(),
      id: match[2],
    };
  }
  return null;
};

export const fetchSpotifyInfo = async (url) => {
  const cached = videoInfoCache.get(url);
  if (cached) {
    return cached;
  }

  // Handle spotify.link short URLs by following redirect
  let resolvedUrl = url;
  if (url.includes('spotify.link/')) {
    try {
      const headRes = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (headRes.url && headRes.url !== url) {
        resolvedUrl = headRes.url;
      }
    } catch {}
  }

  const parsed = parseSpotifyUrl(resolvedUrl);
  if (!parsed) {
    throw new Error('Invalid Spotify URL. Please enter a valid track, playlist, or album link.');
  }

  const { type, id } = parsed;

  // 1. Fetch official oEmbed for high-res thumbnail & fallback title
  let oembed = null;
  try {
    const oembedRes = await fetch(
      `https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (oembedRes.ok) {
      oembed = await oembedRes.json();
    }
  } catch {}

  // 2. Fetch Embed HTML to parse Next.js / initial-state metadata
  const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
  const embedRes = await fetch(embedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!embedRes.ok) {
    throw new Error(`Failed to retrieve Spotify data (HTTP ${embedRes.status}).`);
  }

  const html = await embedRes.text();

  let entity = null;

  // Strategy A: <script id="__NEXT_DATA__">
  const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/);
  if (nextMatch) {
    try {
      const parsedData = JSON.parse(nextMatch[1]);
      entity = parsedData?.props?.pageProps?.state?.data?.entity;
    } catch {}
  }

  // Strategy B: base64 encoded scripts (resource or initial-state)
  if (!entity) {
    const b64Match = html.match(
      /<script id="(?:initial-state|resource)"[^>]*>([\s\S]+?)<\/script>/
    );
    if (b64Match) {
      try {
        const decoded = Buffer.from(b64Match[1].trim(), 'base64').toString('utf8');
        const b64Json = JSON.parse(decoded);
        entity = b64Json?.data?.entity || b64Json?.entity || b64Json;
      } catch {}
    }
  }

  const thumbnail = oembed?.thumbnail_url || entity?.coverArt?.sources?.[0]?.url || null;


  if (type === 'track') {
    const rawName = entity?.name || oembed?.title || 'Spotify Track';
    const artistList = Array.isArray(entity?.artists)
      ? entity.artists.map((a) => (typeof a === 'string' ? a : a.name)).filter(Boolean)
      : [];
    const artists = artistList.join(', ');
    const title = artists ? `${rawName} - ${artists}` : rawName;
    const duration = entity?.duration ? Math.round(entity.duration / 1000) : null;

    const result = {
      title,
      thumbnail,
      duration,
      platform: 'spotify',
      spotifyType: 'track',
      trackName: rawName,
      artists,
      formats: STANDARD_AUDIO_FORMATS,
      audioAvailable: true,
      searchQuery: `${artists} - ${rawName} Official Audio`,
    };

    videoInfoCache.set(url, result);
    return result;
  }

  const rawTrackList = entity?.trackList || [];
  const tracks = rawTrackList.map((t, idx) => {
    const tArtists =
      t.subtitle ||
      (Array.isArray(t.artists)
        ? t.artists.map((a) => (typeof a === 'string' ? a : a.name)).filter(Boolean).join(', ')
        : '');
    const tTitle = t.title || t.name || `Track ${idx + 1}`;
    const tId = t.uri ? t.uri.split(':').pop() : (t.id || String(idx));
    return {
      index: idx + 1,
      id: tId,
      title: tTitle,
      artists: tArtists,
      duration: t.duration ? Math.round(t.duration / 1000) : null,
      previewUrl: t.audioPreview?.url || null,
      downloadUrl: `https://open.spotify.com/track/${tId}`,
      searchQuery: `${tArtists} - ${tTitle} Official Audio`,
    };
  });

  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const containerTitle = entity?.name || oembed?.title || (type === 'playlist' ? 'Spotify Playlist' : 'Spotify Album');

  const result = {
    title: containerTitle,
    thumbnail,
    duration: totalDuration > 0 ? totalDuration : null,
    platform: 'spotify',
    spotifyType: type, // 'playlist' or 'album'
    isCollection: true,
    trackCount: tracks.length,
    tracks,
    formats: STANDARD_AUDIO_FORMATS,
    audioAvailable: true,
  };

  videoInfoCache.set(url, result);
  return result;
};

export const downloadSpotifyTrack = async (url) => {
  let searchQuery = null;
  if (url.includes('spotify.com') || url.includes('spotify:')) {
    try {
      const info = await fetchSpotifyInfo(url);
      searchQuery = info.searchQuery || (info.title ? `${info.title} Official Audio` : null);
    } catch {}
  }
  return downloadAudioBySearch(searchQuery || url.replace(/^https?:\/\//, ''), 'spotifyService');
};
