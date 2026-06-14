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
    print("SSH Connected. Running v3 server manually...")

    transport = client.get_transport()
    channel = transport.open_session()
    channel.setblocking(0)
    
    # Run server.js using Node 22 on PORT 3007
    cmd = "export PORT=3007 && cd /home/u754458241/domains/morsall.com/nodejs && /opt/alt/alt-nodejs22/root/usr/bin/node server.js"
    channel.exec_command(cmd)
    
    start_time = time.time()
    while time.time() - start_time < 12:
        if channel.recv_ready():
            out = channel.recv(1024).decode('utf-8', errors='ignore')
            print(out, end='')
        if channel.recv_stderr_ready():
            err = channel.recv_stderr(1024).decode('utf-8', errors='ignore')
            print("STDERR: " + err, end='')
        if channel.exit_status_ready():
            print(f"\nNode exited with status: {channel.recv_exit_status()}")
            break
        time.sleep(0.5)
        
    if not channel.exit_status_ready():
        print("\nNode v3 is running. Killing process...")
        client.exec_command("pkill -u u754458241 -f 'node server.js'", timeout=10)

    client.close()
except Exception as e:
    print(f"Error: {e}")
