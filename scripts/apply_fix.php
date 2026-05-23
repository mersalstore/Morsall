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
    process.stderr.write(line);
}

// Redirect stdout/stderr
process.stdout.write = process.stderr.write = logFile.write.bind(logFile);

log('--- PRODUCTION SERVER STARTING AT ' + APP_DIR + ' ---');

// Set env
process.env.NODE_ENV = 'production';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

// Load .env
try {
    const envPath = path.join(APP_DIR, '.env');
    require('dotenv').config({ path: envPath });
    log('Loaded env from ' + envPath);
} catch (e) {
    log('Env load error: ' + e.message);
}

// Find node_modules
const nodeModules = '/home/u754458241/nodeapp/node_modules';
process.env.NODE_PATH = nodeModules;
require('module').Module._initPaths();

// Find prisma library
const prismaLib = '/home/u754458241/nodeapp/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node';
if (fs.existsSync(prismaLib)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = prismaLib;
    log('Using prisma library: ' + prismaLib);
}

const next = require('next');
const app = next({ dev: false, dir: APP_DIR });
const handle = app.getRequestHandler();

log('Preparing Next.js...');
app.prepare().then(() => {
    log('Next.js prepared OK');
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            
            if (parsedUrl.pathname === '/check-status') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ALIVE', time: new Date().toISOString() }));
                return;
            }

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
EOD;

if (file_put_contents($target, $content)) {
    echo "Successfully updated $target";
} else {
    echo "Failed to update $target";
}
?>
