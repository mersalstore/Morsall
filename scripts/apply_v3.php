<?php
$target = '/home/u754458241/nodeapp/start_morsall.js';
$content = <<<'EOD'
const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const APP_DIR = '/home/u754458241/domains/morsall.com/public_html/app_new';
const logPath = path.join(APP_DIR, 'server.log');
const logFile = fs.createWriteStream(logPath, { flags: 'a' });

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    logFile.write(line);
}

process.stdout.write = process.stderr.write = logFile.write.bind(logFile);

log('--- PRODUCTION STARTUP V3 ---');
log('CWD: ' + process.cwd());
log('ENV PORT: ' + (process.env.PORT || 'NONE'));

// Load .env
try {
    const envPath = path.join(APP_DIR, '.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        log('Loaded .env');
    } else {
        log('.env NOT FOUND at ' + envPath);
    }
} catch (e) {
    log('Env load error: ' + e.message);
}

// Find node_modules
const nodeModules = '/home/u754458241/nodeapp/node_modules';
process.env.NODE_PATH = nodeModules;
require('module').Module._initPaths();

// Prisma
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
const prismaLib = '/home/u754458241/nodeapp/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node';
if (fs.existsSync(prismaLib)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = prismaLib;
    log('Using Prisma Lib: ' + prismaLib);
}

const next = require('next');
const app = next({ dev: false, dir: APP_DIR });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    log('Next.js Ready');
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            if (parsedUrl.pathname === '/health-check') {
                res.end('OK_V3');
                return;
            }
            await handle(req, res, parsedUrl);
        } catch (err) {
            log('ERROR: ' + err.message);
            res.statusCode = 500;
            res.end('Internal Error');
        }
    });

    const listenTarget = process.env.PORT || 3000;
    
    if (typeof listenTarget === 'string' && listenTarget.includes('/')) {
        log('Target is a socket: ' + listenTarget);
        if (fs.existsSync(listenTarget)) {
            try { fs.unlinkSync(listenTarget); log('Removed existing socket'); } catch(e) {}
        }
    }

    server.listen(listenTarget, () => {
        log('Listening on: ' + listenTarget);
    });
}).catch(err => {
    log('CRITICAL: ' + err.message);
    log(err.stack);
});
EOD;

if (file_put_contents($target, $content)) {
    echo "Successfully updated $target to V3";
} else {
    echo "Failed to update $target";
}
?>
