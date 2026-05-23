const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Log to file
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
process.stdout.write = process.stderr.write = logFile.write.bind(logFile);

console.log('--- EMERGENCY ADMIN BYPASS STARTING ---');

const nodejsDir = '/home/u754458241/domains/morsall.com/nodejs';
const nodeModulesPath = path.join(nodejsDir, 'node_modules');

process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.NODE_ENV = 'production';

// Setup paths
process.env.NODE_PATH = [
  nodeModulesPath,
  path.join(nodeModulesPath, 'next/node_modules')
].join(path.delimiter);
require('module').Module._initPaths();

const next = require('next');
const app = next({ dev: false, dir: nodejsDir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // LOG SESSION ATTEMPTS
      if (req.url.includes('session')) {
         console.log('Session request detected');
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('SERVER_ERROR:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(process.env.PORT || 3000, () => {
      console.log('Emergency Server listening');
  });
});
