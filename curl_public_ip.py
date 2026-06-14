import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def run_public_curl(client):
    commands = [
        "curl -k -I -H 'Host: morsall.com' https://82.198.228.182/test_root.php",
        "curl -k -I -H 'Host: morsall.com' http://82.198.228.182/test_root.php"
    ]
    for cmd in commands:
        print(f"\nExecuting: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        print(f"STDOUT:\n{out}")
        print(f"STDERR:\n{err}")

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    run_public_curl(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
