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

NEW_HTACCESS = """# Enable Passenger and Node
PassengerEnabled on
PassengerAppType node
PassengerStartupFile server-hostinger.js
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
PassengerStartTimeout 300
PassengerMaxRequests 1000

Options -MultiViews -Indexes
RewriteEngine On
RewriteBase /

# EXCLUDE PHP AND OTHER STATIC FILES FROM PASSENGER BY NOT REWRITING THEM
RewriteCond %{REQUEST_URI} \.(php|html|png|jpg|jpeg|gif|ico|svg|css|js|woff|woff2)$ [NC]
RewriteRule .* - [L]

# PASS VIRTUAL ROUTES TO NODE.JS PASSENGER
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ server-hostinger.js/$1 [QSA,L]
"""

def update_and_test():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Write the new .htaccess
        print("Writing updated .htaccess to domains/morsall.com/public_html/.htaccess...")
        sftp = client.open_sftp()
        with sftp.file('/home/u754458241/domains/morsall.com/public_html/.htaccess', 'w') as f:
            f.write(NEW_HTACCESS)
        sftp.close()
        print("Write completed.")
        
        # 2. Kill all stuck processes to start fresh
        print("Killing any residual user processes...")
        client.exec_command("pkill -9 -u u754458241 -f node; pkill -9 -u u754458241 -f passenger; pkill -9 -u u754458241 -f php", timeout=15)
        time.sleep(2)
        
        # 3. Touch restart.txt
        client.exec_command("mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp && touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        print("Touched restart.txt")
        
        client.close()
        
        # 4. Make requests to test
        time.sleep(2)
        
        # Test 1: test_root.php (Should bypass Node and load instantly)
        url_php = "https://morsall.com/test_root.php"
        print(f"\nRequesting: {url_php}...")
        try:
            req = urllib.request.Request(url_php, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=12) as response:
                print(f"PHP HTTP Status: {response.getcode()}")
                print(f"PHP HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"PHP Request failed: {e}")
            
        # Test 2: health (Should go to Node)
        url_node = "https://morsall.com/health"
        print(f"\nRequesting Node endpoint: {url_node}...")
        try:
            req = urllib.request.Request(url_node, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=20) as response:
                print(f"Node HTTP Status: {response.getcode()}")
                print(f"Node HTTP Body: {response.read().decode('utf-8')}")
        except Exception as e:
            print(f"Node Request failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

update_and_test()
