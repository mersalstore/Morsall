import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def run_selector_checks(client):
    commands = [
        "which cloudlinux-selector",
        "cloudlinux-selector list --interpreter nodejs 2>&1",
        "cloudlinux-selector list --interpreter nodejs --user u754458241 2>&1",
        "cl-selector --list=nodejs 2>&1",
        "selectorctl --list-interpreters 2>&1"
    ]
    for cmd in commands:
        print(f"\nExecuting: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
        print(stdout.read().decode('utf-8', errors='ignore'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    run_selector_checks(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
