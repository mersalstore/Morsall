import urllib.request
import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    
    # Write test_root.php to both places
    sftp = client.open_sftp()
    
    # 1. Domains path
    try:
        with sftp.file('/home/u754458241/domains/morsall.com/public_html/test_root.php', 'w') as f:
            f.write('<?php echo "DOMAINS_ROOT"; ?>')
        print("Wrote test_root.php to domains folder.")
    except Exception as e:
        print(f"Could not write to domains folder: {e}")
        
    # 2. Root public_html path
    try:
        with sftp.file('/home/u754458241/public_html/test_root.php', 'w') as f:
            f.write('<?php echo "PUBLIC_HTML_ROOT"; ?>')
        print("Wrote test_root.php to public_html folder.")
    except Exception as e:
        print(f"Could not write to public_html folder: {e}")
        
    sftp.close()
    client.close()

    # Now make request
    url = "https://morsall.com/test_root.php"
    print(f"\nRequesting: {url}")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"HTTP Status: {status}")
            print(f"HTTP Body: {body}")
    except Exception as e:
        print(f"HTTP Request failed: {e}")

except Exception as e:
    print(f"Error: {e}")
