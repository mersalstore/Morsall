import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def compare_dirs(client):
    print("=== COMPARING NODEJS DIR AND NODEAPP DIR ===")
    
    # 1. Check folder sizes and mtimes of key files
    for base in ['/home/u754458241/domains/morsall.com/nodejs', '/home/u754458241/nodeapp']:
        print(f"\nDirectory: {base}")
        stdin, stdout, stderr = client.exec_command(
            f"ls -la {base}/package.json {base}/server.js {base}/server-hostinger.js {base}/.env.production 2>/dev/null", 
            timeout=10
        )
        print(stdout.read().decode('utf-8'))
        
        # Check mtime of recent build files
        stdin, stdout, stderr = client.exec_command(
            f"ls -lt {base}/.next/ | head -5 2>/dev/null", 
            timeout=10
        )
        print("Latest build files mtime (.next):")
        print(stdout.read().decode('utf-8'))
        
        # Check if src/lib/mail.ts exists and what exports it has
        stdin, stdout, stderr = client.exec_command(
            f"grep -n 'sendVerificationEmail' {base}/src/lib/mail.ts 2>/dev/null", 
            timeout=10
        )
        print("sendVerificationEmail in src/lib/mail.ts:")
        print(stdout.read().decode('utf-8') or "(not found)")

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    compare_dirs(client)
    client.close()
except Exception as e:
    print(f"Error: {e}")
