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

def test_nodejs_root():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        sftp = client.open_sftp()
        
        # 1. Write test_root.php to nodejs and nodeapp folders
        try:
            with sftp.file('/home/u754458241/domains/morsall.com/nodejs/test_root.php', 'w') as f:
                f.write('<?php echo "NODEJS_ROOT"; ?>')
            print("Wrote test_root.php to nodejs folder.")
        except Exception as e:
            print(f"Error writing to nodejs: {e}")
            
        try:
            with sftp.file('/home/u754458241/nodeapp/test_root.php', 'w') as f:
                f.write('<?php echo "NODEAPP_ROOT"; ?>')
            print("Wrote test_root.php to nodeapp folder.")
        except Exception as e:
            print(f"Error writing to nodeapp: {e}")
            
        sftp.close()

        # 2. Rename all htaccess files to disable passenger
        print("Disabling all htaccess files...")
        paths = [
            '/home/u754458241/domains/morsall.com/nodejs/.htaccess',
            '/home/u754458241/domains/morsall.com/public_html/.htaccess',
            '/home/u754458241/nodeapp/.htaccess',
            '/home/u754458241/public_html/.htaccess'
        ]
        for p in paths:
            client.exec_command(f"mv {p} {p}.bak 2>/dev/null")
            
        time.sleep(2)
        
        # 3. Test HTTPS loopback with Host header
        cmd = "curl -k -i -H 'Host: morsall.com' https://127.0.0.1/test_root.php"
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
        print("STDOUT:")
        print(stdout.read().decode('utf-8'))
        print("STDERR:")
        print(stderr.read().decode('utf-8'))
        
        # 4. Restore all htaccess files
        print("Restoring all htaccess files...")
        for p in paths:
            client.exec_command(f"mv {p}.bak {p} 2>/dev/null")
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

test_nodejs_root()
