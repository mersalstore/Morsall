import ftplib
import io

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # MINIMAL test server - if this works, Passenger IS starting Node correctly
    minimal_server = '''const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'server.log');
const log = (msg) => {
  const line = `[${new Date().toISOString()}] MINIMAL_TEST: ${msg}\\n`;
  process.stdout.write(line);
  try { fs.appendFileSync(logFile, line); } catch(e) {}
};

log('MINIMAL SERVER STARTING');
log('PORT env: ' + (process.env.PORT || 'NOT SET'));
log('NODE_ENV: ' + process.env.NODE_ENV);

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  log('REQ: ' + req.url);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok',
    url: req.url,
    time: new Date().toISOString(),
    port: port,
    pid: process.pid
  }));
});

server.listen(port, () => {
  log('MINIMAL SERVER LISTENING ON: ' + port);
});

server.on('error', (e) => {
  log('SERVER ERROR: ' + e.message);
});

process.on('uncaughtException', (e) => {
  log('UNCAUGHT: ' + e.message);
});
'''
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")
        
        # First backup current server.js
        ftp.cwd("/nodejs")
        lines = []
        ftp.retrlines("RETR server.js", lambda l: lines.append(l))
        backup = "\n".join(lines)
        with open("server_js_backup_v2.js", "w", encoding="utf-8") as f:
            f.write(backup)
        print("Backed up server.js")
        
        # Upload minimal test server
        ftp.storbinary("STOR server.js", io.BytesIO(minimal_server.encode()))
        print("Uploaded MINIMAL test server.js")
        
        # Delete old server.log to confirm fresh start
        try:
            ftp.delete("server.log")
            print("Deleted old server.log")
        except:
            # Create empty
            ftp.storbinary("STOR server.log", io.BytesIO(b""))
            print("Cleared server.log")
        
        # Touch restart.txt
        try:
            ftp.cwd("/nodejs/tmp")
        except:
            ftp.mkd("/nodejs/tmp")
            ftp.cwd("/nodejs/tmp")
        ftp.storbinary("STOR restart.txt", io.BytesIO(b"restart"))
        print("Triggered restart")
        
        ftp.quit()
        print("\nMinimal server deployed. Wait 60s then check /health")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
