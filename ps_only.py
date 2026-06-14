import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    
    print("=== RUNNING NODE PROCESSES ===")
    stdin, stdout, stderr = client.exec_command("ps aux | grep -i node | grep -v grep", timeout=15)
    print(stdout.read().decode('utf-8'))
    
    print("=== RUNNING PASSENGER PROCESSES ===")
    stdin, stdout, stderr = client.exec_command("ps aux | grep -i passenger | grep -v grep", timeout=15)
    print(stdout.read().decode('utf-8'))

    client.close()
except Exception as e:
    print(f"Error: {e}")
