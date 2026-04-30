const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// Environment variables
process.env.POSTGRES_PRISMA_URL = "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require";
process.env.POSTGRES_URL_NON_POOLING = "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require";
process.env.NEXTAUTH_URL = "https://morsall.com";
process.env.NEXTAUTH_SECRET = "MersalEliteSecret2026";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "949180865508-uc3av4gfh0he5u7dqub8es9g9crgrduu.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""; // REMOVED FOR GITHUB SECURITY
process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
process.env.NODE_ENV = "production";

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
