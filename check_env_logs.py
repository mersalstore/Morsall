import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')

# Check NEXTAUTH_URL and Google Client ID in .env
cmd = "cat /home/u754458241/domains/morsall.com/nodejs/.env"
stdin, stdout, stderr = client.exec_command(cmd)
time.sleep(2)
print(stdout.read().decode('utf-8', errors='ignore'))

# Also check what's in the server stderr log if it exists
cmd2 = "ls -la /home/u754458241/domains/morsall.com/nodejs/logs/ 2>&1; cat /home/u754458241/domains/morsall.com/nodejs/logs/stderr.log 2>&1 | tail -30"
stdin2, stdout2, stderr2 = client.exec_command(cmd2)
time.sleep(2)
print("LOGS:", stdout2.read().decode('utf-8', errors='ignore'))

client.close()
