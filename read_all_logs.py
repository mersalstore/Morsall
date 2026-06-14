import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def read_log(client, path):
    print(f"\n==================================================")
    print(f" LOG FILE: {path}")
    print(f"==================================================")
    stdin, stdout, stderr = client.exec_command(f"tail -n 100 {path} 2>/dev/null", timeout=30)
    out = stdout.read().decode('utf-8', errors='ignore')
    if out:
        print(out)
    else:
        print("(empty or not found)")

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    print("SSH CONNECTED SUCCESS")
    
    read_log(client, '/home/u754458241/domains/morsall.com/nodejs/stderr.log')
    read_log(client, '/home/u754458241/domains/morsall.com/nodejs/server.log')
    read_log(client, '/home/u754458241/nodeapp/stderr.log')
    read_log(client, '/home/u754458241/nodeapp/server.log')
    read_log(client, '/home/u754458241/domains/morsall.com/nodejs/passenger.log')

    client.close()
    print("\nDONE")
except Exception as e:
    print(f"Error: {e}")
