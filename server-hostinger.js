const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// ── Logging ──────────────────────────────────────────────────
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
const log = (...args) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}
`;
  process.stdout.write(line);
  logFile.write(line);
};

log('=== MORSALL SERVER v3 (ASYNC PREP) STARTING ===');

// ── Hostinger Node Modules ────────────────────────────────────
const searchPaths = [
  path.join(__dirname, 'node_modules'),
  '/home/u754458241/nodeapp/node_modules'
];

let nodeModulesPath = '';
for (const p of searchPaths) {
  if (fs.existsSync(p)) {
    log('Found node_modules at:', p);
    nodeModulesPath = p;
    break;
  }
}

if (nodeModulesPath) {
  process.env.NODE_PATH = nodeModulesPath;
  require('module').Module._initPaths();
} else {
  log('WARNING: node_modules NOT FOUND');
}

// ── Environment ───────────────────────────────────────────────
process.env.NODE_ENV = 'production';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
process.env.TOKIO_WORKER_THREADS = '2';
process.env.UV_THREADPOOL_SIZE = '4';

try {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
  log('Loaded .env.production');
} catch (e) {
  log('dotenv not available, using system env');
}

log('DATABASE_URL set:', !!process.env.DATABASE_URL);
log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
log('UPLOAD_DIR:', process.env.UPLOAD_DIR);

// ── Ensure uploads directory exists ──────────────────────────
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    log('Created uploads dir:', uploadsDir);
  } catch (e) {
    log('WARNING: Could not create uploads dir:', e.message);
  }
}

// ── Startup DB Check ─────────────────────────────────────────────
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    const settings = await db.settings.findUnique({ where: { id: 'global' } });
    log('Current logo in DB:', settings?.logo || 'NOT SET');
    await db.$disconnect();
  } catch (e) {
    log('WARNING: Startup DB check failed:', e.message);
  }
})();

// ── Start Next.js ─────────────────────────────────────────────
const next = require('next');
const app = next({ dev: false, dir: __dirname });

let isReady = false;
let handle = null;

app.prepare().then(() => {
  handle = app.getRequestHandler();
  isReady = true;
  log('Next.js preparation complete. Server fully operational!');
}).catch(err => {
  log('PREPARE_ERROR:', err.message);
  log(err.stack);
  process.exit(1);
});

const MIME_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ── Start HTTP Listener Immediately ───────────────────────────
const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  // 1. Health check & Diagnostics (Always responsive, even during boot)
  if (pathname === '/health' || pathname === '/diag') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: isReady ? 'ok' : 'starting',
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      db: process.env.DATABASE_URL ? 'configured' : 'MISSING',
      uploadsExists: fs.existsSync(uploadsDir),
    }));
    return;
  }

  // 2. Return 503 if Next.js is not prepared yet
  if (!isReady) {
    res.statusCode = 503;
    res.setHeader('Retry-After', '3');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h3>الموقع قيد التشغيل والتهيئة الآن... يرجى إعادة تحميل الصفحة بعد ثوانٍ قليلة.</h3><p>Server is starting up and preparing Next.js. Please refresh in a few seconds...</p>');
    return;
  }

  try {
    // ── No-cache for HTML pages & API routes ─────────────────
    const isApi = pathname && pathname.startsWith('/api/');
    const isPage = !pathname || (!pathname.startsWith('/_next/') && !pathname.startsWith('/uploads/') && !pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|js|css|woff|woff2)$/));
    if (isApi || isPage) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }

    // ── Serve uploaded files directly ─────────────────────
    if (pathname && pathname.startsWith('/uploads/')) {
      const fileName = pathname.replace('/uploads/', '');
      if (!fileName || fileName.includes('..') || fileName.includes('/')) {
        res.statusCode = 400;
        res.end('Bad Request');
        return;
      }

      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(fileName).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        fs.createReadStream(filePath).pipe(res);
        return;
      } else {
        res.statusCode = 404;
        res.end('Image not found');
        return;
      }
    }

    // ── Handle all Next.js requests ───────────────────────
    await handle(req, res, parsedUrl);
  } catch (err) {
    log('SERVER_ERROR:', err.message);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

// Bind to port or socket immediately
const listenPort = process.env.PORT || 3000;
server.listen(listenPort, () => {
  log(`HTTP server listening on ${listenPort}`);
});
