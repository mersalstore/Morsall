import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def list_public(client):
    cmd = "ls -la /home/u754458241/domains/morsall.com/public_html/ | head -50"
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    print(stdout.read().decode('utf-8'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    list_public(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
