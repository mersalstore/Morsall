import paramiko
import json
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

# Check required-server-files.json
stdin, stdout, stderr = client.exec_command("cat /home/u754458241/nodeapp/.next/required-server-files.json")
content = stdout.read().decode()
try:
    data = json.loads(content)
    print("JSON IS VALID")
    print("appDir:", data.get('appDir'))
except Exception as e:
    print("JSON IS INVALID:", str(e))
    # Try to fix it if it's invalid (maybe double slashes or something)
    # I'll just write a fresh valid version if I can

# Restore .htaccess to standard
htaccess = """PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerEnabled on
PassengerAppType node
PassengerStartupFile server.js
PassengerAppRoot /home/u754458241/nodeapp

Options -MultiViews
RewriteEngine On
RewriteBase /
"""
sftp = client.open_sftp()
with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
    f.write(htaccess)
sftp.close()

client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
