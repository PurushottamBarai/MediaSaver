import * as ytdlpService from '../services/ytdlpService.js';
import { fetchY2MateStream } from '../services/youtubeService.js';
import { fetchCdnAudioStream } from './constants.js';

/**
 * Downloads audio by searching YouTube.
 * Tier 1: Resolves YouTube ID and streams high-speed pre-converted MP3 from Y2Mate CDN.
 * Tier 2: Falls back to yt-dlp search and download if Tier 1 fails.
 */
export const downloadAudioBySearch = async (searchQuery, logPrefix = 'audioHelper') => {
  process.stdout.write(`[${logPrefix}] Searching audio for: "${searchQuery}"\n`);

  try {
    const videoId = await ytdlpService.resolveSearchVideoId(searchQuery);
    if (videoId) {
      process.stdout.write(`[${logPrefix}] Tier 1: Resolved videoId ${videoId}, fetching Y2Mate CDN stream...\n`);
      const cdnUrl = await fetchY2MateStream(videoId, '720', 'mp3');
      if (cdnUrl) {
        return await fetchCdnAudioStream(cdnUrl);
      }
    }
  } catch (tier1Err) {
    process.stdout.write(`[${logPrefix}] Tier 1 CDN failed (${tier1Err.message}), falling back to yt-dlp...\n`);
  }

  const targetSearch = `ytsearch1:${searchQuery}`;
  return ytdlpService.downloadVideo(targetSearch, 'bestaudio/best', 'audio');
};
