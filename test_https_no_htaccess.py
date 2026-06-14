import paramiko
import sys
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    
    # 1. Rename htaccess
    print("Disabling htaccess...")
    client.exec_command("mv /home/u754458241/domains/morsall.com/public_html/.htaccess /home/u754458241/domains/morsall.com/public_html/.htaccess.bak 2>/dev/null")
    client.exec_command("mv /home/u754458241/public_html/.htaccess /home/u754458241/public_html/.htaccess.bak 2>/dev/null")
    
    time.sleep(2)
    
    # 2. Query HTTPS loopback for test_root.php
    cmd = "curl -k -I -H 'Host: morsall.com' https://127.0.0.1/test_root.php"
    print(f"Executing local origin test: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    print("STDOUT:")
    print(stdout.read().decode('utf-8'))
    print("STDERR:")
    print(stderr.read().decode('utf-8'))
    
    # 3. Restore htaccess
    print("Restoring htaccess...")
    client.exec_command("mv /home/u754458241/domains/morsall.com/public_html/.htaccess.bak /home/u754458241/domains/morsall.com/public_html/.htaccess 2>/dev/null")
    client.exec_command("mv /home/u754458241/public_html/.htaccess.bak /home/u754458241/public_html/.htaccess 2>/dev/null")
    
    client.close()
except Exception as e:
    print(f"Error: {e}")
