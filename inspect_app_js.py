import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def inspect_app(client):
    paths = [
        '/home/u754458241/domains/morsall.com/nodejs/app.js',
        '/home/u754458241/nodeapp/app.js'
    ]
    for p in paths:
        print(f"\n==============================")
        print(f" FILE: {p}")
        print(f"==============================")
        stdin, stdout, stderr = client.exec_command(f"cat {p} 2>/dev/null", timeout=10)
        print(stdout.read().decode('utf-8', errors='ignore'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    inspect_app(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
