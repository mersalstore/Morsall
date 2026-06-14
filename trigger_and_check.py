import urllib.request
import paramiko
import sys
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def make_request():
    url = "https://morsall.com/health"
    print(f"Making request to {url}...")
    try:
        # We set a timeout of 30 seconds
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.getcode()
            body = response.read().decode('utf-8', errors='ignore')
            print(f"HTTP RESPONSE STATUS: {status}")
            print(f"HTTP RESPONSE BODY: {body}")
            return True
    except Exception as e:
        print(f"HTTP REQUEST FAILED: {e}")
        return False

def check_remote_state():
    print("\nConnecting to SSH to check logs and processes...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Process list
        print("\n=== ACTIVE NODE PROCESSES ===")
        stdin, stdout, stderr = client.exec_command("ps aux | grep -i node | grep -v grep", timeout=15)
        print(stdout.read().decode('utf-8'))
        
        # 2. Latest log tail
        print("\n=== LATEST LINES IN server.log ===")
        stdin, stdout, stderr = client.exec_command("tail -n 25 /home/u754458241/domains/morsall.com/nodejs/server.log 2>/dev/null", timeout=15)
        print(stdout.read().decode('utf-8'))

        print("\n=== LATEST LINES IN stderr.log ===")
        stdin, stdout, stderr = client.exec_command("tail -n 25 /home/u754458241/domains/morsall.com/nodejs/stderr.log 2>/dev/null", timeout=15)
        print(stdout.read().decode('utf-8'))

        client.close()
    except Exception as e:
        print(f"SSH Check Error: {e}")

# 1. Trigger request
make_request()

# 2. Wait 3 seconds for Passenger to write logs if it was spawning
time.sleep(3)

# 3. Check logs and processes
check_remote_state()
