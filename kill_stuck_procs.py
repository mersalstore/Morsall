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
    
    print("=== KILLING STUCK PROCESSES ===")
    
    # Kill any node processes
    stdin, stdout, stderr = client.exec_command("pkill -9 -u u754458241 -f node", timeout=15)
    print("Killed all node processes.")
    
    # Kill any passenger processes
    stdin, stdout, stderr = client.exec_command("pkill -9 -u u754458241 -f passenger", timeout=15)
    print("Killed all passenger processes.")
    
    # Kill any php processes (in case of old migrations or stuck scripts)
    stdin, stdout, stderr = client.exec_command("pkill -9 -u u754458241 -f php", timeout=15)
    print("Killed all php processes.")
    
    # Check processes again
    stdin, stdout, stderr = client.exec_command("ps aux | grep -v grep", timeout=15)
    print("\n=== REMAINING PROCESSES ===")
    print(stdout.read().decode('utf-8'))

    client.close()
except Exception as e:
    print(f"Error: {e}")
