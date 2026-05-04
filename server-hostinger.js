const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const next = require('next');
const fs = require('fs');

function bootstrapEnv() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE || 'binary';

  const pool = (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '').trim();
  const direct = (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DIRECT_URL ||
    pool
  ).trim();

  if (!pool) {
    console.error(
      'Missing database URL. Set DATABASE_URL or POSTGRES_PRISMA_URL in Hostinger (Node app environment). Optional: POSTGRES_URL_NON_POOLING.'
    );
    process.exit(1);
  }
  process.env.POSTGRES_PRISMA_URL = pool;
  process.env.POSTGRES_URL_NON_POOLING = direct;
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = pool;

  if (!process.env.NEXTAUTH_URL?.trim() || !process.env.NEXTAUTH_SECRET?.trim()) {
    console.error('Set NEXTAUTH_URL and NEXTAUTH_SECRET in Hostinger environment.');
    process.exit(1);
  }

  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
}

bootstrapEnv();

const dev = false;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const dir = __dirname;

const app = next({ dev, hostname, port, dir });
const handle = app.getRequestHandler();

// Serve static files from _next/static and public directories
const serveStaticFile = (filePath, res) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      
      // Set appropriate content type
      const contentTypes = {
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };
      
      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.statusCode = 200;
      res.end(content);
      return true;
    }
  } catch (err) {
    console.error(`Error serving static file ${filePath}:`, err);
  }
  return false;
};

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const pathname = parsedUrl.pathname;
      
      // Try to serve static files from _next/static
      if (pathname.startsWith('/_next/static/')) {
        const filePath = path.join(dir, pathname);
        if (serveStaticFile(filePath, res)) {
          return;
        }
      }
      
      // Try to serve static files from public
      if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
        const publicPath = path.join(dir, 'public', pathname);
        if (serveStaticFile(publicPath, res)) {
          return;
        }
      }
      
      // Handle all other requests through Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Morsall ready on http://${hostname}:${port}`);
    console.log(`> Environment: production (Hostinger LiteSpeed)`);
    console.log(`> Static files: _next/static and public directories`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
