const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });
if (process.env.DATABASE_URL) {
  const masked = process.env.DATABASE_URL.replace(/:.*@/, ':****@');
  console.log('Loaded DATABASE_URL: ' + masked);
} else {
  console.log('DATABASE_URL NOT FOUND IN ENV');
}


const APP_DIR = '/home/u754458241/domains/morsall.com/public_html/app_new';
const NODEAPP_DIR = '/home/u754458241/nodeapp';
const NODE_MODULES = fs.existsSync(path.join(APP_DIR, 'node_modules/@prisma')) 
  ? path.join(APP_DIR, 'node_modules') 
  : path.join(NODEAPP_DIR, 'node_modules');

// Log file
const logPath = path.join(APP_DIR, 'server.log');
const logFile = fs.createWriteStream(logPath, { flags: 'a' });
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  logFile.write(line);
  process.stderr.write(line);
}

// Redirect stdout and stderr
process.stdout.write = (chunk, encoding, callback) => {
    logFile.write(chunk, encoding, callback);
    return true;
};
process.stderr.write = (chunk, encoding, callback) => {
    logFile.write(chunk, encoding, callback);
    return true;
};

log('--- SERVER STARTING ---');
log('APP_DIR: ' + APP_DIR);
log('NODE_MODULES: ' + NODE_MODULES);

// Set up NODE_PATH to find modules
process.env.NODE_PATH = NODE_MODULES + ':' + path.join(APP_DIR, 'node_modules');
require('module').Module._initPaths();

// Set env
process.env.NODE_ENV = 'production';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
process.env.PRISMA_QUERY_ENGINE_LIBRARY = '/home/u754458241/nodeapp/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node';

// Find prisma binary
const prismaLib = process.env.PRISMA_QUERY_ENGINE_LIBRARY;
if (fs.existsSync(prismaLib)) {
  try { fs.chmodSync(prismaLib, '755'); } catch(e) {}
  log('Found prisma library: ' + prismaLib);
}


try {
  const next = require('next');
  const app = next({ dev: false, dir: APP_DIR });
  const handle = app.getRequestHandler();

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
