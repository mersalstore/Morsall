const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const APP_DIR = '/home/u754458241/domains/morsall.com/public_html/app_new';
const NODE_MODULES = path.join(APP_DIR, 'node_modules');

// Load environment variables
try {
  require('dotenv').config({ path: path.join(APP_DIR, '.env') });
} catch (e) {
  console.error('Failed to load .env:', e.message);
}

// Log file
const logPath = path.join(APP_DIR, 'server.log');
const logFile = fs.createWriteStream(logPath, { flags: 'a' });

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  logFile.write(line);
  process.stderr.write(line);
}

// Redirect stdout and stderr to server.log
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

process.stdout.write = function(chunk, encoding, callback) {
    logFile.write(chunk, encoding, callback);
    return originalStdoutWrite.apply(process.stdout, arguments);
};

process.stderr.write = function(chunk, encoding, callback) {
    logFile.write(chunk, encoding, callback);
    return originalStderrWrite.apply(process.stderr, arguments);
};

log('--- SERVER STARTING WITH IMPROVED LOGGING ---');
log('APP_DIR: ' + APP_DIR);
log('NODE_MODULES: ' + NODE_MODULES + ' exists: ' + fs.existsSync(NODE_MODULES));

if (process.env.DATABASE_URL) {
  const masked = process.env.DATABASE_URL.replace(/:.*@/, ':****@');
  log('Loaded DATABASE_URL: ' + masked);
} else {
  log('DATABASE_URL NOT FOUND IN ENV');
}

// Set up NODE_PATH to find modules
process.env.NODE_PATH = NODE_MODULES;
require('module').Module._initPaths();

// Set env
process.env.NODE_ENV = 'production';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

// Find prisma binary/library
const prismaBinaries = [
  path.join(NODE_MODULES, '.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node'),
  path.join(NODE_MODULES, '.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node'),
  path.join(NODE_MODULES, '.prisma/client/query-engine-debian-openssl-3.0.x'),
  path.join(NODE_MODULES, '.prisma/client/query-engine-rhel-openssl-3.0.x'),
];

for (const bin of prismaBinaries) {
  if (fs.existsSync(bin)) {
    if (bin.endsWith('.node')) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = bin;
        log('Found prisma library: ' + bin);
    } else {
        process.env.PRISMA_QUERY_ENGINE_BINARY = bin;
        try { fs.chmodSync(bin, '755'); } catch(e) {}
        log('Found prisma binary: ' + bin);
    }
    break;
  }
}

try {
  log('Loading Next.js...');
  const next = require('next');
  const app = next({ dev: false, dir: APP_DIR });
  const handle = app.getRequestHandler();

  log('Preparing Next.js app...');
  app.prepare().then(() => {
    log('Next.js prepared OK');
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        log('REQUEST_ERROR: ' + err.message);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(process.env.PORT || 3000, () => {
      log('Server listening on port ' + (process.env.PORT || 3000));
    });
  }).catch(err => {
    log('PREPARE_ERROR: ' + err.message);
    log(err.stack);
    process.exit(1);
  });
} catch (err) {
  log('STARTUP_ERROR: ' + err.message);
  log(err.stack);
  process.exit(1);
}
