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

# 1. Force HTTPS (checks both local HTTPS and X-Forwarded-Proto to prevent CDN loops)
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
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

def setup_standalone_final():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Kill old processes
        print("Cleaning up old processes...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger", timeout=10)
        time.sleep(2)
        
        # 2. Write htaccess to both public_html dirs
        sftp = client.open_sftp()
        for path in [
            '/home/u754458241/domains/morsall.com/public_html/.htaccess',
            '/home/u754458241/public_html/.htaccess'
        ]:
            print(f"Writing proxy .htaccess to {path}...")
            with sftp.file(path, 'w') as f:
                f.write(PROXY_HTACCESS)
        sftp.close()
        
        # 3. Start Node on port 3000
        print("Starting Node.js server standalone on port 3000 in background...")
        cmd_start = "export PORT=3000 && cd /home/u754458241/domains/morsall.com/nodejs && nohup /opt/alt/alt-nodejs22/root/usr/bin/node server-hostinger.js > app.log 2>&1 < /dev/null &"
        client.exec_command(cmd_start)
        
        # Wait 4 seconds for boot
        time.sleep(4)
        
        # 4. Verify locally passing X-Forwarded-Proto header
        print("\n=== CURL LOCAL PROXY TEST ===")
        cmd_curl = "curl -i -H 'Host: morsall.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1/health"
        stdin, stdout, stderr = client.exec_command(cmd_curl, timeout=10)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        
        print("\n=== ACTIVE PROCESSES ===")
        stdin, stdout, stderr = client.exec_command("ps aux | grep -i node | grep -v grep", timeout=10)
        print(stdout.read().decode('utf-8'))
        
        client.close()
        
        # 5. Request live URL
        time.sleep(2)
        url = "https://morsall.com/health"
        print(f"\nRequesting live health endpoint: {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response:
                print(f"Live HTTP Status: {response.getcode()}")
                print(f"Live HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Live request failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

setup_standalone_final()
