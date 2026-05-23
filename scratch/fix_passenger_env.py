import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

htaccess = """PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerEnabled on
PassengerAppType node
PassengerStartupFile startup.js
PassengerAppRoot /home/u754458241/nodeapp
PassengerLogFile /home/u754458241/nodeapp/passenger.log

Options -MultiViews
RewriteEngine On
RewriteBase /
# No RewriteRule here, let Passenger handle it
"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
    f.write(htaccess)
sftp.close()

client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
