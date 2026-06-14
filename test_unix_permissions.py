import paramiko
import sys
import io
import time
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'
SOCKET_PATH = '/home/u754458241/node.sock'

def fix_permissions_and_test():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Chmod 777 socket file
        print(f"Changing permissions of {SOCKET_PATH} to 777...")
        client.exec_command(f"chmod 777 {SOCKET_PATH}", timeout=10)
        time.sleep(1)
        
        # Print permissions
        stdin, stdout, stderr = client.exec_command(f"ls -la {SOCKET_PATH}", timeout=10)
        print(stdout.read().decode('utf-8'))
        
        client.close()
        
        # 2. Test live request
        url = "https://morsall.com/health"
        print(f"Requesting live endpoint: {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response:
                print(f"Live HTTP Status: {response.getcode()}")
                print(f"Live HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Live request failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

fix_permissions_and_test()
