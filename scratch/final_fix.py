import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

content = """const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const logPath = path.join(rootDir, 'server.log');

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\\n`;
    try {
        fs.appendFileSync(logPath, line);
    } catch (e) {}
    console.log(msg);
}

log('--- PRODUCTION SERVER STARTING (FINAL FIX) ---');

try {
    process.env.NODE_ENV = 'production';
    // Ensure correct engine type
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
    
    log('Loading Next.js...');
    const next = require('next');
    const app = next({ dev: false, dir: rootDir });
    const handle = app.getRequestHandler();

    log('Preparing Next.js app...');
    app.prepare().then(() => {
        log('Next.js app prepared. Starting server...');
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                log(`RUNTIME_ERROR: ${err.message}`);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        }).listen(process.env.PORT || 3000, () => {
            log('Server listening');
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

sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/server.js', 'w') as f:
    f.write(content)
sftp.close()

# Also set PassengerStartupFile back to server.js
client.exec_command("sed -i 's/PassengerStartupFile startup.js/PassengerStartupFile server.js/g' /home/u754458241/domains/morsall.com/public_html/.htaccess")
client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
