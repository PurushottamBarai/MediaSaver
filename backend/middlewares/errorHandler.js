const SAFE_STATUS_CODES = new Set([400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
const OTHER_PLATFORMS_REGEX = /dailymotion|vimeo|instagram|facebook|twitter|x\.com|reddit|tiktok|pinterest|threads|linkedin|twitch|snapchat/i;
const YOUTUBE_INDICATORS_REGEX = /youtube\.com|youtu\.be|youtube|bot|player response/i;
const TECHNICAL_ERROR_REGEX = /Command failed|yt-dlp|exit code|\/tmp\/|spawn|ENOENT|ECONNREFUSED/i;

const sanitize = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.split(process.cwd()).join('[SERVER_DIR]');
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const rawStatus = err.status || err.statusCode;
  const statusCode = SAFE_STATUS_CODES.has(rawStatus) ? rawStatus : 500;
  const rawMessage = err.message || 'An unexpected error occurred processing your request.';
  const stderr = err.stderr ? err.stderr.trim() : null;

  process.stderr.write(`[error] ${req.method} ${req.path} → ${statusCode}: ${rawMessage}\n`);
  if (stderr) {
    process.stderr.write(`[error details]: ${stderr}\n`);
  }

  let userMessage = sanitize(rawMessage);
  const fullErrorText = `${rawMessage} ${stderr || ''} ${err.shortMessage || ''}`;
  const reqUrl = req.body?.url || req.query?.url || '';

  const isOtherPlatform = OTHER_PLATFORMS_REGEX.test(reqUrl);
  const isYouTube = !isOtherPlatform && (YOUTUBE_INDICATORS_REGEX.test(reqUrl) || YOUTUBE_INDICATORS_REGEX.test(fullErrorText));

  if (isYouTube) {
    userMessage = 'We are unable to fulfill the request for YouTube right now. Please retry after some time, or try our other supported platforms.';
  } else if (TECHNICAL_ERROR_REGEX.test(fullErrorText)) {
    userMessage = 'Unable to process this video URL at the moment. Please check the link and retry, or try another video.';
  }

  res.status(statusCode).json({ error: userMessage });
};

export default errorHandler;
