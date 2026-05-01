const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Environment variables for Hostinger
process.env.POSTGRES_PRISMA_URL = process.env.POSTGRES_PRISMA_URL || "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require";
process.env.POSTGRES_URL_NON_POOLING = process.env.POSTGRES_URL_NON_POOLING || "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://morsall.com";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "MersalEliteSecret2026";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "949180865508-uc3av4gfh0he5u7dqub8es9g9crgrduu.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
process.env.NODE_ENV = "production";

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
