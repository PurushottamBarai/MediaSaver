import fs from "fs";
import * as youtubeService from "../services/youtubeService.js";
import * as ytdlpService from "../services/ytdlpService.js";
import * as snapchatService from "../services/snapchatService.js";
import * as pinterestService from "../services/pinterestService.js";
import * as threadsService from "../services/threadsService.js";
import * as linkedinService from "../services/linkedinService.js";
import * as spotifyService from "../services/spotifyService.js";
import * as appleMusicService from "../services/appleMusicService.js";
import * as youtubeMusicService from "../services/youtubeMusicService.js";
import * as soundcloudService from "../services/soundcloudService.js";
import * as ffmpegService from "../services/ffmpegService.js";
import { detectPlatform } from "../utils/platformDetector.js";

const FORMAT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const AUDIO_PLATFORMS = new Set(['spotify', 'applemusic', 'youtubemusic', 'soundcloud']);
const downloadStatusMap = new Map();

const setDownloadStatus = (downloadId, status) => {
  if (!downloadId) return;
  downloadStatusMap.set(downloadId, status);
  if (status === 'started' || status === 'error') {
    setTimeout(() => downloadStatusMap.delete(downloadId), 60000);
  }
};

const getDownloadStatus = (req, res) => {
  const { downloadId } = req.query;
  if (!downloadId) {
    return res.status(400).json({ error: "Missing downloadId" });
  }
  const status = downloadStatusMap.get(downloadId) || 'pending';
  res.json({ status });
};

const resolveMediaStream = async (platform, url, formatId, type) => {
  switch (platform) {
    case "youtube":
      return youtubeService.downloadVideo(url, formatId, type);
    case "spotify":
      return spotifyService.downloadSpotifyTrack(url, formatId, type);
    case "applemusic":
      return appleMusicService.downloadAppleMusicTrack(url, formatId, type);
    case "youtubemusic":
      return youtubeMusicService.downloadYouTubeMusicTrack(url, formatId, type);
    case "soundcloud":
      return soundcloudService.downloadSoundCloudTrack(url, formatId, type);
    case "snapchat":
      return snapchatService.downloadVideo(url, type);
    case "pinterest":
      return pinterestService
        .downloadVideo(url)
        .catch(() => ytdlpService.downloadVideo(url, formatId, type));
    case "threads":
      return threadsService
        .downloadVideo(url)
        .catch(() => ytdlpService.downloadVideo(url, formatId, type));
    case "linkedin":
      return ytdlpService
        .downloadVideo(url, formatId, type)
        .catch(() => linkedinService.downloadVideo(url));
    default:
      return ytdlpService.downloadVideo(url, formatId, type).catch((err) => {
        const fullErr = `${err.stderr || ""} ${err.message || ""} ${err.shortMessage || ""}`;
        const ytIdMatch = fullErr.match(/\[youtube\]\s+([a-zA-Z0-9_-]{11})/i);
        if (ytIdMatch && ytIdMatch[1]) {
          return youtubeService.downloadVideo(
            `https://www.youtube.com/watch?v=${ytIdMatch[1]}`,
            formatId,
            type,
          );
        }
        throw err;
      });
  }
};

const downloadMedia = async (req, res, next) => {
  const { url, formatId, type, bitrate, downloadId, title } = req.query;

  setDownloadStatus(downloadId, 'pending');

  if (formatId && !FORMAT_ID_PATTERN.test(formatId)) {
    setDownloadStatus(downloadId, 'error');
    return res.status(400).json({ error: "Invalid formatId provided." });
  }

  try {
    const platform = detectPlatform(url);
    const isAudio = type === "audio" || AUDIO_PLATFORMS.has(platform);

    const safeTitle = title
      ? title.replace(/[^a-zA-Z0-9 _.-]/g, "").trim().slice(0, 120)
      : "";
    const defaultBase = isAudio ? "audio" : "video";
    const filename = `${safeTitle || defaultBase}.${isAudio ? "mp3" : "mp4"}`;

    res.header("Content-Disposition", `attachment; filename="${filename}"`);
    res.header("Content-Type", isAudio ? "audio/mpeg" : "video/mp4");
    res.flushHeaders();

    setDownloadStatus(downloadId, 'started');

    let mediaStream;
    try {
      mediaStream = await resolveMediaStream(platform, url, formatId, type);
    } catch (streamErr) {
      process.stderr.write(
        `[download] Stream resolution failed after headers sent: ${streamErr.message}\n`,
      );
      setDownloadStatus(downloadId, 'error');
      res.end();
      return;
    }

    const cleanup = () => {
      if (
        mediaStream?.tempFilePath &&
        fs.existsSync(mediaStream.tempFilePath)
      ) {
        try {
          fs.unlinkSync(mediaStream.tempFilePath);
        } catch {}
      }
    };

    res.on("close", cleanup);
    res.on("finish", cleanup);

    const attachStreamErrorHandler = (stream, label = 'Stream') => {
      stream.on('error', (err) => {
        if (err.message !== 'aborted' && err.code !== 'ECONNRESET') {
          process.stderr.write(`[download] ${label} error: ${err.message}\n`);
        }
        cleanup();
        if (!res.writableEnded) res.end();
      });
    };

    if (isAudio) {
      if (mediaStream.isMp3Ready) {
        mediaStream.pipe(res);
        attachStreamErrorHandler(mediaStream, 'CDN stream');
        return;
      }
      const conversionSource = mediaStream.tempFilePath || mediaStream;
      ffmpegService.convertToMp3(conversionSource, res, bitrate);
      res.on("error", cleanup);
      return;
    }

    if (type === "mute") {
      const conversionSource = mediaStream.tempFilePath || mediaStream;
      ffmpegService.muteVideo(conversionSource, res);
      res.on("error", cleanup);
      return;
    }

    mediaStream.pipe(res);
    attachStreamErrorHandler(mediaStream, 'Stream');
  } catch (error) {
    setDownloadStatus(req.query.downloadId, 'error');
    if (!res.headersSent) {
      next(error);
    } else {
      process.stderr.write(
        `[download] Error after headers sent: ${error.message}\n`,
      );
      res.end();
    }
  }
};

export { downloadMedia, getDownloadStatus };

