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

log('--- SERVER STARTING ---');

try {
    process.env.NODE_ENV = 'production';
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
    
    const next = require('next');
    const app = next({ dev: false, dir: rootDir });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        log('Next.js prepared');
        createServer(async (req, res) => {
            log(`REQUEST: ${req.method} ${req.url}`);
            log(`HEADERS: ${JSON.stringify(req.headers)}`);
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                log(`ERROR: ${err.message}`);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        }).listen(process.env.PORT || 3000, () => {
            log('Listening');
        });
    }).catch(err => {
        log(`PREPARE_ERROR: ${err.stack}`);
    });
} catch (err) {
    log(`BOOTSTRAP_ERROR: ${err.stack}`);
}
"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/startup.js', 'w') as f:
    f.write(content)
sftp.close()

client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
