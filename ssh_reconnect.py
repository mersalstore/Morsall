import paramiko
import sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'
NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'

attempts = 0
while attempts < 5:
    attempts += 1
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)
        print(f"CONNECTED (attempt {attempts})")
        break
    except Exception as e:
        print(f"Attempt {attempts}: {e}")
        time.sleep(15)
else:
    print("Failed to connect after 5 tries")
    exit(1)

# Try simple commands
for cmd in [
    'echo ALIVE',
    f'ls {NODEJS_DIR}/tmp/restart.txt 2>&1',
    'uptime',
]:
    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        print(f"$ {cmd}")
        print((out or '') + (err or ''))
    except Exception as e:
        print(f"Cmd error: {e}")

client.close()
print("DONE")
