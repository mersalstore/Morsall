import paramiko
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'

def run(client, cmd, timeout=300):
    print(f"$ {cmd[:200]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print(f"STDERR: {err}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED\n")

# Check mysql clients available
print("=== Available mysql clients ===")
run(client, 'which mysql; which mariadb; ls /usr/bin/mysql* 2>/dev/null; ls /usr/bin/mariadb* 2>/dev/null')

# Check .env vs .env.production
print("\n=== .env files presence (without contents) ===")
run(client, f'ls -la {NODEJS_DIR}/.env* 2>&1')

# Get DB credentials from .env (we need them, the script is owned by this user)
# Read just DATABASE_URL line
print("\n=== Read DB URL ===")
out, err = run(client, f'grep "^DATABASE_URL" {NODEJS_DIR}/.env 2>/dev/null | head -1')
db_url = out.strip()
print(f"Found: {db_url[:80]}...")

client.close()
print("DONE")
