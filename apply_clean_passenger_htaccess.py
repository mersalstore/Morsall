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

CLEAN_HTACCESS = """PassengerEnabled on
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs
PassengerAppType node
PassengerStartupFile server-hostinger.js
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
PassengerStartTimeout 300
PassengerMaxRequests 1000

# Redirect HTTP to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
"""

def update_and_test():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Write the clean .htaccess
        print("Writing clean Passenger .htaccess...")
        sftp = client.open_sftp()
        with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
            f.write(CLEAN_HTACCESS)
        sftp.close()
        print("Write completed.")
        
        # 2. Kill all processes
        print("Resetting all remote processes...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger; pkill -9 -u u754458241 -f php", timeout=15)
        time.sleep(2)
        
        # 3. Touch restart.txt
        client.exec_command("mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp && touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        print("Touched restart.txt")
        
        client.close()
        
        # 4. Request to test
        time.sleep(3)
        
        url = "https://morsall.com/health"
        print(f"\nRequesting: {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=25) as response:
                print(f"HTTP Status: {response.getcode()}")
                print(f"HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Request failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

update_and_test()
