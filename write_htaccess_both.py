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

PROXY_HTACCESS = """# Disable Passenger
PassengerEnabled off

Options -MultiViews -Indexes
RewriteEngine On
RewriteBase /

# 1. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Serve actual files directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule .* - [L]

# 3. Exclude static assets
RewriteCond %{REQUEST_URI} ^/_next/static/ [NC,OR]
RewriteCond %{REQUEST_URI} ^/uploads/ [NC]
RewriteRule .* - [L]

# 4. Proxy to Node on port 3000
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
"""

def update_both():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        sftp = client.open_sftp()
        
        # 1. Write to domains public_html
        path1 = '/home/u754458241/domains/morsall.com/public_html/.htaccess'
        print(f"Writing to {path1}...")
        with sftp.file(path1, 'w') as f:
            f.write(PROXY_HTACCESS)
            
        # 2. Write to root public_html
        path2 = '/home/u754458241/public_html/.htaccess'
        print(f"Writing to {path2}...")
        with sftp.file(path2, 'w') as f:
            f.write(PROXY_HTACCESS)
            
        sftp.close()
        print("Write completed successfully.")
        
        # Kill and restart the node app just to be clean
        print("Restarting Node app on port 3000...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger", timeout=10)
        time.sleep(2)
        cmd_start = "export PORT=3000 && cd /home/u754458241/domains/morsall.com/nodejs && nohup /opt/alt/alt-nodejs22/root/usr/bin/node server-hostinger.js > app.log 2>&1 < /dev/null &"
        client.exec_command(cmd_start)
        
        client.close()
        
        # Test request
        time.sleep(5)
        url = "https://morsall.com/health"
        print(f"\nQuerying: {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response:
                print(f"HTTP Status: {response.getcode()}")
                print(f"HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Request failed: {e}")
            
    except Exception as e:
        print(f"Error: {e}")

update_both()
