import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def read_logs(client):
    paths = [
        '/home/u754458241/domains/morsall.com/nodejs/server.log',
        '/home/u754458241/domains/morsall.com/nodejs/stderr.log',
        '/home/u754458241/nodeapp/server.log',
        '/home/u754458241/nodeapp/stderr.log'
    ]
    for p in paths:
        print(f"\n==============================")
        print(f" FILE: {p}")
        print(f"==============================")
        stdin, stdout, stderr = client.exec_command(f"ls -la {p} 2>/dev/null", timeout=10)
        print(stdout.read().decode('utf-8').strip())
        stdin, stdout, stderr = client.exec_command(f"tail -n 15 {p} 2>/dev/null", timeout=10)
        print(stdout.read().decode('utf-8'))
        
    print("\n=== ACTIVE NODE/PASSENGER PROCESSES ===")
    stdin, stdout, stderr = client.exec_command("ps aux | grep -E 'node|passenger' | grep -v grep", timeout=10)
    print(stdout.read().decode('utf-8'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    read_logs(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
