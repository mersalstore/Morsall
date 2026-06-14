const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Load environment variables
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        console.log('Loaded .env from:', envPath);
    }
} catch (e) {
    console.error('Error loading .env:', e);
}

// Use __dirname to be path-independent
const rootDir = __dirname;
const logPath = path.join(rootDir, 'server.log');

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync(logPath, line);
    } catch (e) {
        // Fallback if log file is not writable
    }
    console.log(msg);
}

log('--- PRODUCTION SERVER STARTING (AUTO-DETECT PRISMA) ---');
// --- TEMPORARY PRISMA GENERATE BOOTSTRAP ---
try {
    log("BOOTSTRAP: Running prisma generate...");
    const { execSync } = require('child_process');
    const cmd = `"${process.execPath}" ./node_modules/prisma/build/index.js generate`;
    log("BOOTSTRAP: Running command: " + cmd);
    const genOut = execSync(cmd, { cwd: __dirname });
    log("BOOTSTRAP: Prisma generate output:\n" + genOut.toString());
} catch (e) {
    log("BOOTSTRAP: Prisma generate failed: " + e.message);
    if (e.stderr) {
        log("BOOTSTRAP: Stderr: " + e.stderr.toString());
    }
    if (e.stdout) {
        log("BOOTSTRAP: Stdout: " + e.stdout.toString());
    }
}
// --- END TEMPORARY PRISMA GENERATE BOOTSTRAP ---


try {
    process.env.NODE_ENV = 'production';
    
    // Set engine type to match schema.prisma
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

    // Auto-detect the correct prisma library (.so.node)
    const prismaPath = path.join(rootDir, 'node_modules', '.prisma', 'client');
    if (fs.existsSync(prismaPath)) {
        const files = fs.readdirSync(prismaPath);
        const libFile = files.find(f => f.startsWith('libquery_engine') && f.endsWith('.so.node'));
        if (libFile) {
            const fullLibPath = path.join(prismaPath, libFile);
            process.env.PRISMA_QUERY_ENGINE_LIBRARY = fullLibPath;
            log(`Found prisma library: ${fullLibPath}`);
        } else {
            // Fallback for binary engine if library not found
            const binFile = files.find(f => f.startsWith('query-engine') && !f.includes('.'));
            if (binFile) {
                const fullBinPath = path.join(prismaPath, binFile);
                process.env.PRISMA_QUERY_ENGINE_BINARY = fullBinPath;
                process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
                log(`Found prisma binary: ${fullBinPath}`);
            }
        }
    }

    const port = process.env.PORT || 3000;
    log(`Detected PORT/SOCKET: ${port}`);

    const next = require('next');
    log('Next.js module required.');

    const app = next({ dev: false, dir: rootDir });
    const handle = app.getRequestHandler();

    log('Preparing Next.js app...');
    app.prepare().then(() => {
        log('Next.js app prepared. Creating server...');
        
        const server = createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                log(`RUNTIME_ERROR: ${err.message}`);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        });

        server.listen(port, () => {
            log(`Server listening on ${port}`);
        });

    }).catch(err => {
        log(`PREPARE_ERROR: ${err.stack}`);
        process.exit(1);
    });

} catch (err) {
    log(`FATAL_BOOTSTRAP_ERROR: ${err.stack}`);
    process.exit(1);
}
