import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def inspect_files(client):
    dirs = [
        '/home/u754458241/domains/morsall.com/nodejs',
        '/home/u754458241/nodeapp'
    ]
    for d in dirs:
        print(f"\n========================================")
        print(f" Directory: {d}")
        print(f"========================================")
        for f in ['server.js', 'server-hostinger.js']:
            print(f"\nFile: {f}")
            stdin, stdout, stderr = client.exec_command(f"head -n 25 {d}/{f} 2>/dev/null", timeout=10)
            print(stdout.read().decode('utf-8'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    inspect_files(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
