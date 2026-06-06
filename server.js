const { spawn } = require('child_process');
const http = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const logPath = path.join(rootDir, 'server.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logPath, line);
  } catch (e) {}
  console.log(msg);
}

// ── Check if Child Process ───────────────────────────────────
if (process.argv.includes('--child')) {
  log('--- CHILD PROCESS STARTED (SAFE V8) ---');
  runRealServer();
} else {
  log('--- PARENT PROCESS STARTED (PROXY BOOT) ---');
  runParentProxy();
}

function runParentProxy() {
  const parentPort = process.env.PORT || '3000';
  let childPort;
  
  if (isNaN(parentPort)) {
    childPort = 3099;
  } else {
    childPort = parseInt(parentPort, 10) + 10;
  }
  
  startProxyAndChild(parentPort, childPort);
}

function startProxyAndChild(parentPort, childPort) {
  log(`Spawning child process on port ${childPort} with trap handler disabled...`);
  
  const childEnv = { 
    ...process.env, 
    PORT: childPort.toString(),
    NODE_OPTIONS: '--disable-wasm-trap-handler'
  };
  
  const child = spawn(process.execPath, [
    '--disable-wasm-trap-handler',
    __filename,
    '--child'
  ], {
    cwd: rootDir,
    env: childEnv,
    stdio: 'inherit'
  });
  
  child.on('exit', (code, signal) => {
    log(`Child process exited with code ${code} and signal ${signal}. Exiting parent...`);
    process.exit(code || 1);
  });
  
  // Create proxy server to forward all traffic
  const proxy = http.createServer((req, res) => {
    const options = {
      hostname: '127.0.0.1',
      port: childPort,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      log(`Proxy Request Error: ${err.message}`);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Bad Gateway: Child server is starting or unavailable.`);
    });
    
    req.pipe(proxyReq);
  });
  
  // For socket path vs port number
  if (isNaN(parentPort)) {
    proxy.listen(parentPort, () => {
      log(`Parent proxy listening on socket ${parentPort}`);
    });
  } else {
    proxy.listen(parseInt(parentPort, 10), () => {
      log(`Parent proxy listening on port ${parentPort}`);
    });
  }
  
  // Handle parent process termination
  process.on('SIGTERM', () => {
    log('Parent received SIGTERM, killing child...');
    child.kill('SIGTERM');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    log('Parent received SIGINT, killing child...');
    child.kill('SIGINT');
    process.exit(0);
  });
}

function runRealServer() {
  // Load environment variables
  try {
    const envPath = path.join(rootDir, '.env.production');
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath });
      log('Loaded .env.production');
    }
  } catch (e) {
    log('dotenv not available');
  }

  process.env.NODE_ENV = 'production';
  process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

  // Ensure uploads directory exists
  const uploadsDir = process.env.UPLOAD_DIR || path.join(rootDir, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
      log('Created uploads dir');
    } catch (e) {
      log('WARNING: Cannot create uploads dir:', e.message);
    }
  }

  const next = require('next');
  const app = next({ dev: false, dir: rootDir });
  const handle = app.getRequestHandler();

  const MIME_TYPES = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  app.prepare().then(() => {
    const server = http.createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;

        // Health check
        if (pathname === '/health' || pathname === '/diag') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            version: 'v2-proxy',
            time: new Date().toISOString(),
            db: process.env.DATABASE_URL ? 'configured' : 'MISSING',
            uploadsDir,
            uploadsExists: fs.existsSync(uploadsDir),
          }));
          return;
        }

        // Custom extract deployment route via Node process
        if (pathname === '/extract-deploy-node') {
          const { exec } = require('child_process');
          const zipFile = path.join(rootDir, 'fast_update.zip');
          log(`Extracting ${zipFile} into ${rootDir}...`);
          exec(`unzip -oq "${zipFile}" -d "${rootDir}"`, (err, stdout, stderr) => {
            if (err) {
              log(`Extraction failed: ${err.message}`);
              res.setHeader('Content-Type', 'text/plain');
              res.end(`ERROR: ${err.message}\nSTDERR: ${stderr}`);
              return;
            }
            log('Extraction succeeded! Copying static files...');
            exec(`cp -rf "${rootDir}/_next/static" "/home/u754458241/domains/morsall.com/public_html/_next/" && cp -rf ${rootDir}/public/* "/home/u754458241/domains/morsall.com/public_html/"`, (err2, stdout2, stderr2) => {
              if (err2) {
                log(`Copy files failed: ${err2.message}`);
                res.setHeader('Content-Type', 'text/plain');
                res.end(`PARTIAL_SUCCESS: Extracted, but copy failed: ${err2.message}`);
                return;
              }
              log('Copy static files succeeded! Touching restart.txt...');
              const restartFile = path.join(rootDir, 'tmp', 'restart.txt');
              try {
                if (!fs.existsSync(path.dirname(restartFile))) {
                  fs.mkdirSync(path.dirname(restartFile), { recursive: true });
                }
                fs.writeFileSync(restartFile, 'restart');
                log('Restart triggered!');
                res.setHeader('Content-Type', 'text/plain');
                res.end('SUCCESS_DEPLOY_AND_RESTART');
              } catch (e) {
                res.setHeader('Content-Type', 'text/plain');
                res.end(`PARTIAL_SUCCESS: Extracted and copied, but restart touch failed: ${e.message}`);
              }
            });
          });
          return;
        }

        // Serve uploads directly
        if (pathname && pathname.startsWith('/uploads/')) {
          const fileName = pathname.replace('/uploads/', '');
          if (!fileName || fileName.includes('..') || fileName.includes('/')) {
            res.statusCode = 400; res.end('Bad Request'); return;
          }
          const filePath = path.join(uploadsDir, fileName);
          if (fs.existsSync(filePath)) {
            const ext = path.extname(fileName).toLowerCase();
            const mime = MIME_TYPES[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            fs.createReadStream(filePath).pipe(res);
            return;
          } else {
            res.statusCode = 404; res.end('Image not found'); return;
          }
        }

        await handle(req, res, parsedUrl);
      } catch (err) {
        log(`SERVER_ERROR: ${err.message}`);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(process.env.PORT || 3000, () => {
      log(`Real Server listening on port ${process.env.PORT}`);
    });
  }).catch(err => {
    log(`PREPARE_ERROR: ${err.stack}`);
    process.exit(1);
  });
}
