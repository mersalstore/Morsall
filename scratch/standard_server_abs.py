import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

content = """const { createServer } = require('http');
const next = require('next');
const path = require('path');

const appDir = '/home/u754458241/nodeapp';
const app = next({ dev: false, dir: appDir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(process.env.PORT || 3000);
});
"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/server.js', 'w') as f:
    f.write(content)
sftp.close()

client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
