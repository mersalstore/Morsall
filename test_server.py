import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')

cmd = "cd /home/u754458241/domains/morsall.com/nodejs && timeout 20 /opt/alt/alt-nodejs20/root/usr/bin/node server.js 2>&1"
stdin, stdout, stderr = client.exec_command(cmd)
import time
time.sleep(12)
output = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')
print("STDOUT:", output[:3000])
print("STDERR:", err[:2000])
client.close()
