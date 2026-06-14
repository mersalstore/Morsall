import urllib.request
import paramiko
import sys
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def toggle_and_test():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # 1. Rename .htaccess to .htaccess.bak
        print("Renaming .htaccess to .htaccess.bak...")
        client.exec_command("mv /home/u754458241/domains/morsall.com/public_html/.htaccess /home/u754458241/domains/morsall.com/public_html/.htaccess.bak 2>/dev/null")
        client.exec_command("mv /home/u754458241/public_html/.htaccess /home/u754458241/public_html/.htaccess.bak 2>/dev/null")
        
        # Wait 2 seconds for Apache to reload config
        time.sleep(2)
        
        # 2. Make request
        url = "https://morsall.com/test_root.php"
        print(f"Requesting: {url} while .htaccess is disabled...")
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                print(f"HTTP Status: {status}")
                print(f"HTTP Body: {body}")
        except Exception as e:
            print(f"HTTP Request failed: {e}")
            
        # 3. Restore .htaccess
        print("Restoring .htaccess files...")
        client.exec_command("mv /home/u754458241/domains/morsall.com/public_html/.htaccess.bak /home/u754458241/domains/morsall.com/public_html/.htaccess 2>/dev/null")
        client.exec_command("mv /home/u754458241/public_html/.htaccess.bak /home/u754458241/public_html/.htaccess 2>/dev/null")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

toggle_and_test()
