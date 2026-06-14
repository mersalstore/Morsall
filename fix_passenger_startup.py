import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def fix_passenger(client):
    print("=== FIXING HTACCESS FILES ===")
    # 1. Update /home/u754458241/domains/morsall.com/public_html/.htaccess
    htaccess_path = '/home/u754458241/domains/morsall.com/public_html/.htaccess'
    
    # Read the current content
    stdin, stdout, stderr = client.exec_command(f"cat {htaccess_path}", timeout=15)
    content = stdout.read().decode('utf-8', errors='ignore')
    
    if content:
        print(f"Read htaccess from {htaccess_path}")
        if 'PassengerStartupFile server.js' in content:
            new_content = content.replace('PassengerStartupFile server.js', 'PassengerStartupFile server-hostinger.js')
            # Write back the updated htaccess
            sftp = client.open_sftp()
            with sftp.file(htaccess_path, 'w') as f:
                f.write(new_content)
            sftp.close()
            print("Successfully updated PassengerStartupFile to server-hostinger.js in htaccess")
        else:
            print("PassengerStartupFile server.js was not found in htaccess (already updated?)")
    else:
        print(f"Failed to read or find {htaccess_path}")

    # 2. Overwrite server.js with server-hostinger.js in both directories
    dirs = [
        '/home/u754458241/domains/morsall.com/nodejs',
        '/home/u754458241/nodeapp'
    ]
    print("\n=== COPYING SERVER-HOSTINGER.JS TO SERVER.JS ===")
    for d in dirs:
        print(f"Processing directory: {d}")
        # Backup existing server.js if it exists and is not already a backup
        client.exec_command(f"cp -n {d}/server.js {d}/server_backup_proxy.js 2>/dev/null", timeout=10)
        # Copy server-hostinger.js to server.js
        stdin, stdout, stderr = client.exec_command(f"cp -f {d}/server-hostinger.js {d}/server.js", timeout=10)
        err = stderr.read().decode('utf-8')
        if err:
            print(f"Error copying in {d}: {err}")
        else:
            print(f"Successfully copied server-hostinger.js to server.js in {d}")
            
    # 3. Touch restart.txt in both dirs
    print("\n=== TRIGGERING PASSENGER RESTART ===")
    for d in dirs:
        client.exec_command(f"mkdir -p {d}/tmp && touch {d}/tmp/restart.txt", timeout=10)
        print(f"Touched {d}/tmp/restart.txt")

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    fix_passenger(client)
    client.close()
    print("\nALL OPERATIONS COMPLETED SUCCESS")
except Exception as e:
    print(f"Error: {e}")
