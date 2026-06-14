import paramiko
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'
NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'
NODE_BIN = '/opt/alt/alt-nodejs20/root/usr/bin/node'

import re
def safe_print(s, max_chars=4000):
    s = re.sub(r'mysql://[^\s\'"]+', 'mysql://[REDACTED]', s)
    s = re.sub(r'DATABASE_URL\s*=\s*\S+', 'DATABASE_URL=[REDACTED]', s)
    if len(s) > max_chars:
        s = s[:max_chars] + "\n... [truncated]"
    print(s)

def run(client, cmd, timeout=300):
    print(f"$ {cmd[:200]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED\n")

# Check if mysql CLI is available — that's the easiest path
print("=== Check mysql CLI ===")
out, err = run(client, 'which mysql mysqldump mariadb 2>&1; mysql --version 2>&1 | head -3')
safe_print(out + err)

# Try to find mysql via hostinger paths
print("\n=== Search common mysql paths ===")
out, err = run(client, 'ls /usr/bin/mysql 2>&1; ls /opt/mysql/bin/mysql 2>&1; ls /usr/local/bin/mysql 2>&1; ls /opt/cpanel/bin/mysql 2>&1')
safe_print(out + err)

# Also check for mysql2 node package
print("\n=== Check node mysql packages ===")
out, err = run(client, f'ls {NODEJS_DIR}/node_modules/mysql2/package.json 2>&1; ls {NODEJS_DIR}/node_modules/mysql/package.json 2>&1')
safe_print(out + err)

client.close()
print("\nDONE")
