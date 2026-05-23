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
const next = require('next');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/app.js', 'w') as f:
    f.write(content)
sftp.close()

# Update .htaccess
htaccess = """PassengerEnabled on
PassengerAppType node
PassengerStartupFile app.js
PassengerAppRoot /home/u754458241/nodeapp

Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ app.js/$1 [QSA,L]
"""
with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
    f.write(htaccess)

client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
