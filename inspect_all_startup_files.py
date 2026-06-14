import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def inspect_startups(client):
    files = ['startup.js', 'app_new_server.js', 'real_server.js']
    dirs = ['/home/u754458241/domains/morsall.com/nodejs', '/home/u754458241/nodeapp']
    for d in dirs:
        for f in files:
            path = f"{d}/{f}"
            print(f"\n==============================")
            print(f" FILE: {path}")
            print(f"==============================")
            stdin, stdout, stderr = client.exec_command(f"cat {path} 2>/dev/null", timeout=10)
            print(stdout.read().decode('utf-8', errors='ignore'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    inspect_startups(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
