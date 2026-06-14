import paramiko
import sys
import io
import time
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

NEW_SERVER_CODE = """const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// ── Logging ──────────────────────────────────────────────────
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
const log = (...args) => {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  process.stdout.write(line);
  logFile.write(line);
};

log('=== MORSALL SERVER v3 (ASYNC PREP) STARTING ===');

// ── Hostinger Node Modules ────────────────────────────────────
const searchPaths = [
  path.join(__dirname, 'node_modules'),
  '/home/u754458241/nodeapp/node_modules'
];

let nodeModulesPath = '';
for (const p of searchPaths) {
  if (fs.existsSync(p)) {
    log('Found node_modules at:', p);
    nodeModulesPath = p;
    break;
  }
}

if (nodeModulesPath) {
  process.env.NODE_PATH = nodeModulesPath;
  require('module').Module._initPaths();
} else {
  log('WARNING: node_modules NOT FOUND');
}

// ── Environment ───────────────────────────────────────────────
process.env.NODE_ENV = 'production';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';

try {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
  log('Loaded .env.production');
} catch (e) {
  log('dotenv not available, using system env');
}

log('DATABASE_URL set:', !!process.env.DATABASE_URL);
log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
log('UPLOAD_DIR:', process.env.UPLOAD_DIR);

// ── Ensure uploads directory exists ──────────────────────────
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    log('Created uploads dir:', uploadsDir);
  } catch (e) {
    log('WARNING: Could not create uploads dir:', e.message);
  }
}

// ── Startup DB Check ─────────────────────────────────────────────
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    const settings = await db.settings.findUnique({ where: { id: 'global' } });
    log('Current logo in DB:', settings?.logo || 'NOT SET');
    await db.$disconnect();
  } catch (e) {
    log('WARNING: Startup DB check failed:', e.message);
  }
})();

// ── Start Next.js ─────────────────────────────────────────────
const next = require('next');
const app = next({ dev: false, dir: __dirname });

let isReady = false;
let handle = null;

app.prepare().then(() => {
  handle = app.getRequestHandler();
  isReady = true;
  log('Next.js preparation complete. Server fully operational!');
}).catch(err => {
  log('PREPARE_ERROR:', err.message);
  log(err.stack);
  process.exit(1);
});

const MIME_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ── Start HTTP Listener Immediately ───────────────────────────
const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  // 1. Health check & Diagnostics (Always responsive, even during boot)
  if (pathname === '/health' || pathname === '/diag') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: isReady ? 'ok' : 'starting',
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      db: process.env.DATABASE_URL ? 'configured' : 'MISSING',
      uploadsExists: fs.existsSync(uploadsDir),
    }));
    return;
  }

  // 2. Return 503 if Next.js is not prepared yet
  if (!isReady) {
    res.statusCode = 503;
    res.setHeader('Retry-After', '3');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h3>الموقع قيد التشغيل والتهيئة الآن... يرجى إعادة تحميل الصفحة بعد ثوانٍ قليلة.</h3><p>Server is starting up and preparing Next.js. Please refresh in a few seconds...</p>');
    return;
  }

  try {
    // ── No-cache for HTML pages & API routes ─────────────────
    const isApi = pathname && pathname.startsWith('/api/');
    const isPage = !pathname || (!pathname.startsWith('/_next/') && !pathname.startsWith('/uploads/') && !pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|js|css|woff|woff2)$/));
    if (isApi || isPage) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }

    // ── Serve uploaded files directly ─────────────────────
    if (pathname && pathname.startsWith('/uploads/')) {
      const fileName = pathname.replace('/uploads/', '');
      if (!fileName || fileName.includes('..') || fileName.includes('/')) {
        res.statusCode = 400;
        res.end('Bad Request');
        return;
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
        res.statusCode = 404;
        res.end('Image not found');
        return;
      }
    }

    // ── Handle all Next.js requests ───────────────────────
    await handle(req, res, parsedUrl);
  } catch (err) {
    log('SERVER_ERROR:', err.message);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

// Bind to port or socket immediately
const listenPort = process.env.PORT || 3000;
server.listen(listenPort, () => {
  log(`HTTP server listening on ${listenPort}`);
});
"""

PASSENGER_HTACCESS = """# Enable Passenger
PassengerEnabled on
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerStartTimeout 300
PassengerMaxRequests 1000
PassengerLogFile /home/u754458241/domains/morsall.com/nodejs/passenger.log

# Redirect HTTP to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
"""

def update_and_redeploy():
    # 1. Update local server-hostinger.js file
    local_path = 'd:\\New-folder\\matger2\\server-hostinger.js'
    print(f"Updating local {local_path}...")
    with open(local_path, 'w', encoding='utf-8') as f:
        f.write(NEW_SERVER_CODE)
    
    # 2. Update remote server-hostinger.js and server.js files
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        sftp = client.open_sftp()
        
        # Write htaccess files
        for htpath in [
            '/home/u754458241/domains/morsall.com/public_html/.htaccess',
            '/home/u754458241/public_html/.htaccess'
        ]:
            print(f"Writing Passenger htaccess to {htpath}...")
            with sftp.file(htpath, 'w') as f:
                f.write(PASSENGER_HTACCESS)
                
        # Write server files
        dirs = [
            '/home/u754458241/domains/morsall.com/nodejs',
            '/home/u754458241/nodeapp'
        ]
        for d in dirs:
            print(f"Writing server-hostinger.js and server.js to {d}...")
            with sftp.file(f"{d}/server-hostinger.js", 'w') as f:
                f.write(NEW_SERVER_CODE)
            with sftp.file(f"{d}/server.js", 'w') as f:
                f.write(NEW_SERVER_CODE)
                
        sftp.close()
        
        # 3. Kill all processes
        print("Resetting all remote processes to clear LVE containers...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger; pkill -9 -u u754458241 -f php", timeout=15)
        time.sleep(2)
        
        # 4. Touch restart.txt
        for d in dirs:
            client.exec_command(f"mkdir -p {d}/tmp && touch {d}/tmp/restart.txt")
        print("Touched restart.txt in both application roots.")
        
        client.close()
        
        # 5. Make request to trigger Passenger boot
        time.sleep(3)
        url = "https://morsall.com/health"
        print(f"\nRequesting live health endpoint: {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            # We set a shorter timeout because the server should respond instantly with "starting" or "ok"!
            with urllib.request.urlopen(req, timeout=12) as response:
                print(f"HTTP Status: {response.getcode()}")
                print(f"HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Request failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

update_and_redeploy()
