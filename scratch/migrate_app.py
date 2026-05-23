import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

# Restore page.js
client.exec_command("mv /home/u754458241/nodeapp/.next/server/app/page.js.bak /home/u754458241/nodeapp/.next/server/app/page.js")

# Create a new folder to bypass any passenger cache
client.exec_command("rm -rf /home/u754458241/nodeapp_new && cp -r /home/u754458241/nodeapp /home/u754458241/nodeapp_new")

# Update .htaccess
htaccess = """PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerEnabled on
PassengerAppType node
PassengerStartupFile server.js
PassengerAppRoot /home/u754458241/nodeapp_new

Options -MultiViews
RewriteEngine On
RewriteBase /
"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
    f.write(htaccess)
sftp.close()

client.exec_command("mkdir -p /home/u754458241/nodeapp_new/tmp && touch /home/u754458241/nodeapp_new/tmp/restart.txt")
client.close()
print("Done!")
