import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'
LOG_PATH = '/home/u754458241/domains/morsall.com/nodejs/passenger.log'

def read_passenger_log(client):
    print(f"Checking {LOG_PATH}...")
    stdin, stdout, stderr = client.exec_command(f"ls -la {LOG_PATH} 2>/dev/null", timeout=10)
    out = stdout.read().decode('utf-8')
    if out:
        print(out.strip())
        stdin, stdout, stderr = client.exec_command(f"cat {LOG_PATH} 2>/dev/null", timeout=10)
        print("CONTENT:")
        print(stdout.read().decode('utf-8', errors='ignore'))
    else:
        print("Log file not found.")

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    read_passenger_log(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
