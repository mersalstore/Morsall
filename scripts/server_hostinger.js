const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Logging
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
const log = (...args) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  process.stdout.write(line);
  logFile.write(line);
};

log('=== MORSALL SERVER v2 STARTING ===');

// Environment
process.env.NODE_ENV = 'production';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';

// Load env
try {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
  log('Loaded .env.production');
} catch (e) {
  log('dotenv not available');
}

log('DB URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// Uploads dir
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
log('Uploads dir:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    log('Created uploads dir');
  } catch (e) {
    log('WARNING: Cannot create uploads dir:', e.message);
  }
}

const MIME_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.avif': 'image/avif',
};

const next = require('next');
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Health check
      if (pathname === '/health' || pathname === '/diag') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          version: 'v2',
          time: new Date().toISOString(),
          db: process.env.DATABASE_URL ? 'configured' : 'MISSING',
          uploadsDir,
          uploadsExists: fs.existsSync(uploadsDir),
        }));
        return;
      }

      // Serve uploads directly
      if (pathname && pathname.startsWith('/uploads/')) {
        const fileName = decodeURIComponent(pathname.slice('/uploads/'.length));
        if (!fileName || fileName.includes('..')) {
          res.statusCode = 400; res.end('Bad Request'); return;
        }
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(fileName).toLowerCase();
          const mime = MIME_TYPES[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Access-Control-Allow-Origin', '*');
          fs.createReadStream(filePath).pipe(res);
          log('Served upload:', fileName);
          return;
        } else {
          log('Upload not found:', filePath);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Image not found');
          return;
        }
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      log('SERVER_ERROR:', err.message);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(process.env.PORT || 3000, () => {
    log(`Server v2 ready on port ${process.env.PORT || 3000}`);
  });
}).catch(err => {
  log('PREPARE_ERROR:', err.message, err.stack);
  process.exit(1);
});