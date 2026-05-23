import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

content = """const { createServer } = require('http');
createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PASSENGER IS WORKING: ' + req.url);
}).listen(process.env.PORT || 3000);
"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/test_passenger.js', 'w') as f:
    f.write(content)

# Update .htaccess
htaccess = """PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerEnabled on
PassengerAppType node
PassengerStartupFile test_passenger.js
PassengerAppRoot /home/u754458241/nodeapp

Options -MultiViews
RewriteEngine On
RewriteBase /
"""
with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
    f.write(htaccess)

sftp.close()

client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
print("Done!")
