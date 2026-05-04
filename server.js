const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const next = require('next');

function bootstrapEnv() {
  process.env.NODE_ENV = process.env.NODE_ENV || "production";
  process.env.PRISMA_CLIENT_ENGINE_TYPE =
    process.env.PRISMA_CLIENT_ENGINE_TYPE || "binary";

  const pool = (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || "").trim();
  const direct = (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DIRECT_URL ||
    pool
  ).trim();

  if (!pool) {
    console.error(
      "Missing database URL. Set DATABASE_URL or POSTGRES_PRISMA_URL (Hostinger env). Optional: POSTGRES_URL_NON_POOLING."
    );
    process.exit(1);
  }
  process.env.POSTGRES_PRISMA_URL = pool;
  process.env.POSTGRES_URL_NON_POOLING = direct;
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = pool;

  if (
    !process.env.NEXTAUTH_URL?.trim() ||
    !process.env.NEXTAUTH_SECRET?.trim()
  ) {
    console.error(
      "Set NEXTAUTH_URL and NEXTAUTH_SECRET in Hostinger (or VPS .env)."
    );
    process.exit(1);
  }

  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
}

bootstrapEnv();

const dev = false;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const dir = __dirname;

const app = next({ dev, hostname, port, dir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Morsall ready on http://${hostname}:${port}`);
    console.log(`> Environment: production`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
