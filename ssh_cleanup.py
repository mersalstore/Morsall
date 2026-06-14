import paramiko
import sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED")

# Wait 30s for forks to recover
print("Sleeping 30s to let process pressure ease...")
time.sleep(30)

# Try a simple command
stdin, stdout, stderr = client.exec_command('echo OK && id', timeout=20)
print(stdout.read().decode())
print(stderr.read().decode())

# Now look for our prisma/node processes via /proc if available
stdin, stdout, stderr = client.exec_command('ps -ef | grep -E "node|prisma" | grep -v grep | head -10 2>&1', timeout=30)
print("Processes:")
print(stdout.read().decode())

# Try fork-light command — use built-in shell
stdin, stdout, stderr = client.exec_command('test -f /usr/bin/mysql && echo HAS_MYSQL || echo NO_MYSQL', timeout=20)
print(stdout.read().decode())

client.close()
print("DONE")
