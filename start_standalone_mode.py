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

PROXY_HTACCESS = """# Disable Passenger to bypass Hostinger bugs
PassengerEnabled off

Options -MultiViews -Indexes
RewriteEngine On
RewriteBase /

# 1. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Serve actual files directly (like PHP and images)
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule .* - [L]

# 3. Exclude static assets served directly by LiteSpeed for performance
RewriteCond %{REQUEST_URI} ^/_next/static/ [NC,OR]
RewriteCond %{REQUEST_URI} ^/uploads/ [NC]
RewriteRule .* - [L]

# 4. Reverse Proxy virtual routes to Node.js on port 3000
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
"""

def setup_standalone():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Kill any existing node/passenger processes
        print("Cleaning up old processes...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger; pkill -9 -u u754458241 -f php", timeout=15)
        time.sleep(2)
        
        # 2. Write the proxy .htaccess
        print("Writing proxy-based .htaccess...")
        sftp = client.open_sftp()
        with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
            f.write(PROXY_HTACCESS)
        sftp.close()
        print("Write completed.")
        
        # 3. Start Node.js standalone in the background on PORT 3000
        print("Starting Node.js server standalone on port 3000 in background...")
        cmd_start = "export PORT=3000 && cd /home/u754458241/domains/morsall.com/nodejs && nohup /opt/alt/alt-nodejs22/root/usr/bin/node server-hostinger.js > app.log 2>&1 < /dev/null &"
        client.exec_command(cmd_start)
        
        # Wait 4 seconds for Next.js to boot and prepare
        time.sleep(4)
        
        # 4. Check if Node is listening on port 3000 locally
        print("\n=== TESTING LOCAL PORT 3000 ===")
        stdin, stdout, stderr = client.exec_command("curl -i http://127.0.0.1:3000/health", timeout=10)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        print("STDERR:")
        print(stderr.read().decode('utf-8'))
        
        # 5. Check active node processes
        print("\n=== ACTIVE PROCESSES ===")
        stdin, stdout, stderr = client.exec_command("ps aux | grep -i node | grep -v grep", timeout=10)
        print(stdout.read().decode('utf-8'))
        
        client.close()
        
        # 6. Make request to the live URL
        time.sleep(2)
        url_health = "https://morsall.com/health"
        print(f"\nRequesting live health endpoint: {url_health}...")
        try:
            req = urllib.request.Request(url_health, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response:
                print(f"HTTP Status: {response.getcode()}")
                print(f"HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Live request failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

setup_standalone()
