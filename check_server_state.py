import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')

# Check what's happening inside the .next build - look at server components
# Let's see what the stderr log path is and also look at the nodejs folder
cmd = """find /home/u754458241/domains/morsall.com/nodejs -name "*.log" 2>/dev/null; \
find /home/u754458241/domains/morsall.com -name "stderr*" -o -name "error*log" 2>/dev/null | head -10"""
stdin, stdout, stderr = client.exec_command(cmd)
time.sleep(3)
print("LOG FILES:", stdout.read().decode('utf-8', errors='ignore'))

# Check if the .next build has the test-db route
cmd2 = "ls /home/u754458241/domains/morsall.com/nodejs/.next/server/app/api/ 2>&1 | head -20"
stdin2, stdout2, stderr2 = client.exec_command(cmd2)
time.sleep(2)
print("API ROUTES:", stdout2.read().decode('utf-8', errors='ignore'))

client.close()
