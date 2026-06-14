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

PASSENGER_HTACCESS = """# Enable Passenger
PassengerEnabled on
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
PassengerStartTimeout 300
PassengerMaxRequests 1000
PassengerLogFile /home/u754458241/domains/morsall.com/nodejs/passenger.log

# Redirect HTTP to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
"""

def setup_clean_passenger():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Update both htaccess files to Passenger Enabled
        sftp = client.open_sftp()
        for path in [
            '/home/u754458241/domains/morsall.com/public_html/.htaccess',
            '/home/u754458241/public_html/.htaccess'
        ]:
            print(f"Writing Passenger config to {path}...")
            with sftp.file(path, 'w') as f:
                f.write(PASSENGER_HTACCESS)
        sftp.close()
        
        # 2. Force overwrite server.js with server-hostinger.js (single-process) in both locations
        dirs = [
            '/home/u754458241/domains/morsall.com/nodejs',
            '/home/u754458241/nodeapp'
        ]
        print("Ensuring server.js is the single-process code...")
        for d in dirs:
            client.exec_command(f"cp -f {d}/server-hostinger.js {d}/server.js", timeout=10)
            
        # 3. Kill all processes to clear CageFS state
        print("Killing all node/passenger processes...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger; pkill -9 -u u754458241 -f php", timeout=15)
        time.sleep(2)
        
        # 4. Touch restart.txt
        for d in dirs:
            client.exec_command(f"mkdir -p {d}/tmp && touch {d}/tmp/restart.txt")
        print("Touched restart.txt in both application roots.")
        
        client.close()
        
        # 5. Make request to trigger Passenger boot
        time.sleep(3)
        url = "https://morsall.com/health"
        print(f"\nRequesting live health endpoint: {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            # Give it 45 seconds to boot Next.js in the background
            with urllib.request.urlopen(req, timeout=45) as response:
                print(f"HTTP Status: {response.getcode()}")
                print(f"HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Live request failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

setup_clean_passenger()
