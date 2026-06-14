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

UNIX_HTACCESS = """# Disable Passenger
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

# 4. Proxy to Unix Socket
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ unix:/home/u754458241/node.sock|http://localhost/$1 [P,L]
"""

def setup_unix_proxy():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Kill old processes and delete old socket file
        print("Cleaning up old processes and socket files...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger", timeout=10)
        client.exec_command(f"rm -f {SOCKET_PATH}", timeout=10)
        time.sleep(2)
        
        # 2. Write .htaccess to both directories
        sftp = client.open_sftp()
        for path in [
            '/home/u754458241/domains/morsall.com/public_html/.htaccess',
            '/home/u754458241/public_html/.htaccess'
        ]:
            print(f"Writing Unix proxy .htaccess to {path}...")
            with sftp.file(path, 'w') as f:
                f.write(UNIX_HTACCESS)
        sftp.close()
        
        # 3. Start Node.js server to listen on Unix Socket
        print(f"Starting Node.js standalone listening on Unix socket: {SOCKET_PATH}...")
        cmd_start = f"export PORT={SOCKET_PATH} && cd /home/u754458241/domains/morsall.com/nodejs && nohup /opt/alt/alt-nodejs22/root/usr/bin/node server-hostinger.js > app.log 2>&1 < /dev/null &"
        client.exec_command(cmd_start)
        
        # Wait 4 seconds for boot
        time.sleep(4)
        
        # 4. Verify socket file and test locally via Unix socket
        print("\n=== VERIFYING SOCKET FILE ===")
        stdin, stdout, stderr = client.exec_command(f"ls -la {SOCKET_PATH}", timeout=10)
        print(stdout.read().decode('utf-8'))
        
        print("=== CURL LOCAL VIA UNIX SOCKET ===")
        cmd_curl = f"curl --unix-socket {SOCKET_PATH} -i http://localhost/health"
        stdin, stdout, stderr = client.exec_command(cmd_curl, timeout=10)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        print("STDERR:")
        print(stderr.read().decode('utf-8'))
        
        client.close()
        
        # 5. Test live URL
        time.sleep(2)
        url = "https://morsall.com/health"
        print(f"\nRequesting live endpoint: {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response:
                print(f"Live HTTP Status: {response.getcode()}")
                print(f"Live HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Live request failed: {e}")
            
    except Exception as e:
        print(f"Error: {e}")

setup_unix_proxy()
