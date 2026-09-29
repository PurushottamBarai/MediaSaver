import express from 'express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

import rateLimiter from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import infoRoutes from './routes/infoRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = Object.freeze({
  PORT: parseInt(process.env.PORT || '3001', 10),
  ENV: process.env.NODE_ENV || 'production',
  DEFAULT_ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://mediasaver-57yu.onrender.com',
    'https://mediasaver.onrender.com',
    'https://mediasaver.codedeck.me',
  ],
  KEEP_ALIVE_TIMEOUT_MS: 65000,
  HEADERS_TIMEOUT_MS: 66000,
  SHUTDOWN_TIMEOUT_MS: 10000,
  FRONTEND_DIST: path.resolve(__dirname, '../frontend/dist'),
});

const VALID_STATIC_ROUTES = new Set([
  '/',
  '/about',
  '/privacy-policy',
  '/terms-of-service',
  '/dmca',
  '/user-guide',
  '/contact',
  '/feedback',
  '/guide',
  '/x-video-downloader',
  '/youtube-video-downloader',
  '/instagram-reel-downloader',
  '/facebook-video-downloader',
  '/twitter-video-downloader',
  '/pinterest-video-downloader',
  '/reddit-video-downloader',
  '/linkedin-video-downloader',
  '/snapchat-video-downloader',
  '/threads-video-downloader',
  '/vimeo-video-downloader',
  '/twitch-clip-downloader',
  '/dailymotion-video-downloader',
  '/spotify-downloader',
  '/apple-music-downloader',
  '/youtube-music-downloader',
  '/soundcloud-downloader',
]);

const findImpersonateBinary = () => {
  try {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const pyScript = [
      'import sys, os, pathlib, shutil',
      'paths = [',
      '    shutil.which("yt-dlp"),',
      '    os.path.join(sys.prefix, "bin", "yt-dlp"),',
      '    os.path.join(sys.prefix, "Scripts", "yt-dlp.exe"),',
      '    os.path.join(str(pathlib.Path.home()), ".local", "bin", "yt-dlp")',
      ']',
      'found = [p for p in paths if p and os.path.exists(p)]',
      'print(found[0] if found else "")',
    ].join('\n');

    const binary = execFileSync(pythonCmd, ['-c', pyScript], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (binary && fs.existsSync(binary)) {
      const targets = execFileSync(binary, ['--list-impersonate-targets'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      if (targets && /chrome|firefox/i.test(targets)) {
        return binary;
      }
    }
  } catch {}
  return null;
};

const updateYtDlpBinary = async () => {
  try {
    const impersonateBinary = findImpersonateBinary();
    if (impersonateBinary) {
      process.env.YTDLP_CUSTOM_BINARY = impersonateBinary;
      process.stdout.write(`[yt-dlp] Impersonate-capable binary detected at ${impersonateBinary}\n`);
      return;
    }
  } catch {}

  try {
    const isWin = process.platform === 'win32';
    const isLinux = process.platform === 'linux';
    const assetName = isWin
      ? 'yt-dlp.exe'
      : (isLinux ? (os.arch() === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux') : 'yt-dlp');
    const targetPath = path.join(os.tmpdir(), assetName);
    const nightlyUrl = `https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/${assetName}`;
    const stableUrl = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`;

    process.stdout.write(`[yt-dlp] Fetching binary to ${targetPath}...\n`);

    let binaryRes = await fetch(nightlyUrl, {
      headers: { 'User-Agent': 'mediasaver/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(60000),
    });

    if (!binaryRes.ok) {
      binaryRes = await fetch(stableUrl, {
        headers: { 'User-Agent': 'mediasaver/1.0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(60000),
      });
    }

    if (!binaryRes.ok) throw new Error(`Binary download failed with HTTP ${binaryRes.status}`);

    const buffer = await binaryRes.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    fs.chmodSync(targetPath, 0o755);

    process.env.YTDLP_CUSTOM_BINARY = targetPath;
    process.stdout.write(`[yt-dlp] Binary ready at ${targetPath} (${buffer.byteLength} bytes)\n`);
  } catch (err) {
    process.stderr.write(`[yt-dlp] Initialization notice: ${err.message}\n`);
  }
};

const createApp = () => {
  const app = express();

  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  const allowedOrigins = Array.from(new Set([...CONFIG.DEFAULT_ALLOWED_ORIGINS, ...envOrigins]));

  app.set('trust proxy', 1);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }));

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': [
          "'self'",
          'https://www.googletagmanager.com',
          'https://*.googletagmanager.com',
          'https://www.google-analytics.com',
          'https://*.google-analytics.com',
          'https://analytics.google.com',
          'https://*.analytics.google.com',
          "'unsafe-inline'",
        ],
        'script-src-elem': [
          "'self'",
          'https://www.googletagmanager.com',
          'https://*.googletagmanager.com',
          'https://www.google-analytics.com',
          'https://*.google-analytics.com',
          'https://analytics.google.com',
          'https://*.analytics.google.com',
          "'unsafe-inline'",
        ],
        'connect-src': [
          "'self'",
          'https://analytics.google.com',
          'https://*.analytics.google.com',
          'https://www.google-analytics.com',
          'https://*.google-analytics.com',
          'https://www.googletagmanager.com',
          'https://*.googletagmanager.com',
          'https://www.google.com',
          'https://*.google.com',
          'https://stats.g.doubleclick.net',
        ],
        'img-src': ["'self'", 'https:', 'data:', 'blob:'],
        'media-src': ["'self'", 'https:', 'data:', 'blob:'],
        'frame-src': [
          "'self'",
          'https://www.youtube.com',
          'https://www.youtube-nocookie.com',
          'https://v2.y2jar.cc',
          'https://challenges.cloudflare.com',
        ],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));

  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${req.headers.host || req.hostname}${req.originalUrl}`);
    }
    next();
  });

  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(rateLimiter);

  // First-party telemetry proxy (adblocker-resistant, zero client-side duplication)
  app.get('/t/lib.js', async (req, res) => {
    try {
      const id = req.query.id || 'G-9SP0C2B2H7';
      const upstream = await fetch(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
      if (!upstream.ok) return res.status(upstream.status).end();
      const text = await upstream.text();
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
      return res.send(text);
    } catch {
      return res.status(500).end();
    }
  });

  app.all('/t/g/collect', express.raw({ type: '*/*', limit: '50kb' }), async (req, res) => {
    try {
      const targetUrl = `https://analytics.google.com/g/collect?${new URLSearchParams(req.query).toString()}`;
      const headers = {
        'User-Agent': req.headers['user-agent'] || '',
        'Accept-Language': req.headers['accept-language'] || '',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      };
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
      }

      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.method === 'POST' ? req.body : undefined,
      });

      return res.status(upstream.status).end();
    } catch {
      return res.status(204).end();
    }
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/info', infoRoutes);
  app.use('/api/download', downloadRoutes);
  app.use('/api/feedback', feedbackRoutes);

  app.use((req, res, next) => {
    if (req.method === 'GET' && req.path.length > 1 && req.path.endsWith('/')) {
      const query = req.url.slice(req.path.length);
      const nonTrailing = req.path.replace(/\/+$/, '');
      return res.redirect(301, nonTrailing + query);
    }
    next();
  });

  app.use(express.static(CONFIG.FRONTEND_DIST, {
    redirect: false,
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      }
    },
  }));

  app.use((req, res) => {
    const prerenderedFile = path.join(CONFIG.FRONTEND_DIST, req.path.slice(1), 'index.html');
    if (VALID_STATIC_ROUTES.has(req.path) || fs.existsSync(prerenderedFile)) {
      if (fs.existsSync(prerenderedFile)) {
        return res.status(200).sendFile(prerenderedFile);
      }
      return res.status(200).sendFile(path.join(CONFIG.FRONTEND_DIST, 'index.html'));
    }

    const custom404 = path.join(CONFIG.FRONTEND_DIST, '404.html');
    if (fs.existsSync(custom404)) {
      return res.status(404).sendFile(custom404);
    }
    return res.status(404).sendFile(path.join(CONFIG.FRONTEND_DIST, 'index.html'));
  });

  app.use(errorHandler);

  return app;
};

const bootstrap = async () => {
  await updateYtDlpBinary();

  const app = createApp();
  const server = app.listen(CONFIG.PORT, () => {
    process.stdout.write(`[server] Running on port ${CONFIG.PORT} in ${CONFIG.ENV} mode\n`);
  });

  server.keepAliveTimeout = CONFIG.KEEP_ALIVE_TIMEOUT_MS;
  server.headersTimeout = CONFIG.HEADERS_TIMEOUT_MS;

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      process.stderr.write(`[server] ERROR: Port ${CONFIG.PORT} is already in use.\n`);
    } else {
      process.stderr.write(`[server] Fatal error: ${err.message}\n`);
    }
    process.exit(1);
  });

  let isShuttingDown = false;
  const shutdown = (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    process.stdout.write(`[server] ${signal} received — shutting down gracefully\n`);
    server.close(() => {
      process.stdout.write('[server] Closed all connections\n');
      process.exit(0);
    });

    const forceTimer = setTimeout(() => {
      process.stderr.write('[server] Forced shutdown after timeout\n');
      process.exit(1);
    }, CONFIG.SHUTDOWN_TIMEOUT_MS);
    forceTimer.unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    process.stderr.write(`[server] Unhandled Promise Rejection: ${reason instanceof Error ? reason.stack : reason}\n`);
  });

  process.on('uncaughtException', (err) => {
    process.stderr.write(`[server] Uncaught Exception: ${err.stack || err}\n`);
    shutdown('UNCAUGHT_EXCEPTION');
  });
};

bootstrap().catch((err) => {
  process.stderr.write(`[server] Bootstrap failure: ${err.stack || err.message}\n`);
  process.exit(1);
});
