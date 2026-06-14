import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def inspect_selector(client):
    commands = [
        "ls -la /home/u754458241/.cl.selector/",
        "find /home/u754458241/.cl.selector/ -type f 2>/dev/null | xargs tail -n 20 2>/dev/null",
        "ls -la /home/u754458241/.logs/",
        "cat /home/u754458241/.logs/mail.log 2>/dev/null | tail -n 20"
    ]
    for cmd in commands:
        print(f"\nExecuting: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
        print(stdout.read().decode('utf-8', errors='ignore'))

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    inspect_selector(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
