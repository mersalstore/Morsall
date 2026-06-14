import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    clean_server_content = """const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Set environment variables to limit thread usage (CRITICAL for Hostinger shared hosting limits)
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';

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
    const line = `[${new Date().toISOString()}] ${msg}\\n`;
    try {
        fs.appendFileSync(logPath, line);
    } catch (e) {
        // Fallback if log file is not writable
    }
    console.log(msg);
}

log('--- PRODUCTION SERVER STARTING (AUTO-DETECT PRISMA) ---');

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
"""
    
    try:
        # Save locally first
        with open("clean_server.js", "w", encoding="utf-8") as f:
            f.write(clean_server_content)
            
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        
        # Upload clean server.js
        with open("clean_server.js", "rb") as f:
            ftp.storbinary("STOR server.js", f)
        print("Uploaded clean server.js.")
        
        # Delete temporary script query_db_diagnostics.js from server to keep it clean
        try:
            ftp.delete("query_db_diagnostics.js")
            print("Deleted query_db_diagnostics.js from server.")
        except:
            pass
            
        # Touch restart.txt
        try:
            ftp.cwd("/nodejs/tmp")
            ftp.storbinary("STOR restart.txt", open("empty.txt", "rb"))
            print("Uploaded restart.txt to reload.")
        except Exception as e:
            print(f"Failed to upload restart.txt: {e}")
            
        ftp.quit()
        print("Cleanup completed successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
