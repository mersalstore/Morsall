import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

content = """const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'server.log');
fs.writeFileSync(logFile, 'SIMPLE SERVER START\\n');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SIMPLE SERVER WORKING\\n');
}).listen(process.env.PORT || 3000, () => {
    fs.appendFileSync(logFile, 'LISTENING\\n');
});
"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/server.js', 'w') as f:
    f.write(content)
sftp.close()

client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
