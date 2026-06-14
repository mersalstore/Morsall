import paramiko
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'
NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED")

# Check if any prisma processes still running
stdin, stdout, stderr = client.exec_command('ps aux | grep -i prisma | grep -v grep | head -5', timeout=30)
out = stdout.read().decode('utf-8', errors='ignore')
print("\n=== running prisma processes ===")
print(out if out else "(none)")

# Check if db push left any lock/state
stdin, stdout, stderr = client.exec_command(f'ls -la {NODEJS_DIR}/prisma/.prisma_db_push_lock 2>&1; ls {NODEJS_DIR}/node_modules/.prisma/client/ 2>&1 | head -5', timeout=30)
out = stdout.read().decode('utf-8', errors='ignore')
print("\n=== state files ===")
print(out)

client.close()
print("DONE")
