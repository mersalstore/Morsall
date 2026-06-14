import paramiko
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

transport = paramiko.Transport((HOST, PORT))
transport.connect(username=USER, password=PASS)
sftp = paramiko.SFTPClient.from_transport(transport)
print("SFTP CONNECTED")

# Read .htaccess in public_html
remote_htaccess = '/home/u754458241/domains/morsall.com/public_html/.htaccess'
try:
    with sftp.open(remote_htaccess, 'r') as f:
        content = f.read().decode('utf-8', errors='ignore')
    print(f"\n=== Current .htaccess at {remote_htaccess} ===")
    print(content)
except Exception as e:
    print(f".htaccess read failed: {e}")

# Touch restart.txt
nodejs_restart = '/home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt'
try:
    with sftp.open(nodejs_restart, 'w') as f:
        f.write('')
    print(f"\n✅ Touched {nodejs_restart}")
except Exception as e:
    print(f"Touch failed: {e}")

sftp.close()
transport.close()
print("DONE")
