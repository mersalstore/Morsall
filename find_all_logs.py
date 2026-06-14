import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def find_logs(client):
    cmd = "find /home/u754458241/ -type f -name '*.log' -o -name '*_log' -o -name 'stderr' -o -name 'stdout' 2>/dev/null | xargs ls -lt 2>/dev/null | head -30"
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=20)
    print(stdout.read().decode('utf-8'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    find_logs(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
