// Minimal single-process Next.js server for Hostinger Passenger.
// No child/spawn/proxy — that pattern was crash-looping (child exited code 0).
const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');
// --- Antigravity Fixes for Hostinger ---
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
process.env.TOKIO_WORKER_THREADS = '2';
process.env.UV_THREADPOOL_SIZE = '4';
// --------------------------------------

const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
const log = (...a) => {
  const line = `[${new Date().toISOString()}] ${a.join(' ')}\n`;
  process.stdout.write(line);
  try { logFile.write(line); } catch {}
};

log('=== MORSALL SERVER (single-process) STARTING ===');

process.env.NODE_ENV = 'production';

try {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
  log('Loaded .env.production');
} catch (e) {
  log('dotenv not available:', e.message);
}

const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 }); } catch {}
}

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.avif': 'image/avif',
};

const next = require('next');
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      if (pathname === '/health' || pathname === '/diag') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString(), db: process.env.DATABASE_URL ? 'set' : 'missing' }));
        return;
      }

      if (pathname && pathname.startsWith('/uploads/')) {
        const fileName = decodeURIComponent(pathname.slice('/uploads/'.length));
        if (!fileName || fileName.includes('..')) { res.statusCode = 400; res.end('Bad Request'); return; }
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(fileName).toLowerCase();
          res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        res.statusCode = 404; res.end('Image not found'); return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      log('SERVER_ERROR:', err && err.message);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, () => log(`Server ready on port ${PORT}`));
}).catch(err => {
  log('PREPARE_ERROR:', err && err.message, err && err.stack);
  process.exit(1);
});
