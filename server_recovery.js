const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Log to file
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
process.stdout.write = process.stderr.write = logFile.write.bind(logFile);

console.log('--- RECOVERY STARTING ---');
console.log('Time:', new Date().toISOString());

// Point to the correct node_modules location
const appDir = '/home/u754458241/domains/morsall.com/public_html';
const nodeModulesPath = path.join(appDir, 'node_modules_prisma_only');

process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.NODE_ENV = 'production';

// Setup paths to find 'next' and other deps
process.env.NODE_PATH = [
  nodeModulesPath,
  path.join(nodeModulesPath, 'next/node_modules'),
  path.join(nodeModulesPath, '@next/env/node_modules')
].join(path.delimiter);
require('module').Module._initPaths();

try {
    const next = require('next');
    const app = next({ dev: false, dir: appDir });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
      createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true);
          await handle(req, res, parsedUrl);
        } catch (err) {
          console.error('SERVER_ERROR:', err);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }).listen(process.env.PORT || 3000, () => {
          console.log('Recovery Server listening');
      });
    }).catch(err => {
      console.error('PREPARE_ERROR:', err);
      process.exit(1);
    });
} catch (e) {
    console.error('FATAL_LOAD_ERROR:', e.message);
    process.exit(1);
}
