import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def check_binaries(client):
    versions = ['alt-nodejs18', 'alt-nodejs20', 'alt-nodejs22', 'alt-nodejs24']
    for ver in versions:
        path = f"/opt/alt/{ver}/root/usr/bin/node"
        print(f"\nChecking: {path}")
        stdin, stdout, stderr = client.exec_command(f"ls -la {path} 2>/dev/null", timeout=10)
        out = stdout.read().decode('utf-8')
        if out:
            print(out.strip())
            stdin, stdout, stderr = client.exec_command(f"{path} --version 2>/dev/null", timeout=10)
            print("Version:", stdout.read().decode('utf-8').strip())
        else:
            print("Not found")

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    check_binaries(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
