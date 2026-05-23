const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const logPath = path.join(rootDir, 'server.log');
const logFile = fs.createWriteStream(logPath, { flags: 'a' });

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    logFile.write(line);
    process.stderr.write(line);
}

// Redirect stdout and stderr
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

log('--- ROOT SERVER STARTING WITH IMPROVED LOGGING ---');

// Load .env from public_html or app_new
try {
    const envPath = fs.existsSync(path.join(rootDir, '.env')) 
        ? path.join(rootDir, '.env')
        : path.join(rootDir, 'app_new/.env');
    require('dotenv').config({ path: envPath });
    log('Loaded env from: ' + envPath);
} catch (e) {
    log('Failed to load .env: ' + e.message);
}

if (process.env.DATABASE_URL) {
  const masked = process.env.DATABASE_URL.replace(/:.*@/, ':****@');
  log('DATABASE_URL: ' + masked);
}

// SEARCH FOR node_modules
let nodeModulesPath = '';
const searchPaths = [
    path.join(rootDir, 'node_modules'),
    path.join(rootDir, 'app_new/node_modules'),
    '/home/u754458241/nodeapp/node_modules'
];

for (const p of searchPaths) {
    if (fs.existsSync(p)) {
        log('Found node_modules at: ' + p);
        nodeModulesPath = p;
        break;
    }
}

if (!nodeModulesPath) {
    log('CRITICAL: node_modules NOT FOUND');
    process.exit(1);
}

process.env.NODE_ENV = 'production';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

// Find prisma library
const prismaLib = '/home/u754458241/nodeapp/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node';
if (fs.existsSync(prismaLib)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = prismaLib;
    log('Using prisma library: ' + prismaLib);
}

process.env.NODE_PATH = nodeModulesPath;
require('module').Module._initPaths();

const next = require('next');
const app = next({ dev: false, dir: rootDir });
const handle = app.getRequestHandler();

log('Preparing Next.js app...');
app.prepare().then(() => {
  log('Next.js prepared OK');
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      log('SERVER_ERROR: ' + err.message);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(process.env.PORT || 3000, () => {
      log('Server listening on port ' + (process.env.PORT || 3000));
  });
}).catch(err => {
    log('PREPARE_ERROR: ' + err.message);
    log(err.stack);
});
