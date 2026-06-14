import paramiko
import sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'
NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'
PUBLIC_HTML = '/home/u754458241/domains/morsall.com/public_html'

# Connect with retries
client = None
for attempt in range(8):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        print(f"CONNECTED (attempt {attempt+1})")
        break
    except Exception as e:
        print(f"Attempt {attempt+1} failed: {e}")
        time.sleep(15)

if not client:
    sys.exit(1)

def run(cmd, timeout=180):
    print(f"$ {cmd[:200]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print(f"STDERR: {err[:400]}")

# Move + extract
run(f"mv {PUBLIC_HTML}/fast_update.zip {NODEJS_DIR}/ 2>/dev/null; mv {PUBLIC_HTML}/prisma_small.zip {NODEJS_DIR}/ 2>/dev/null; echo MOVED")
run(f"cd {NODEJS_DIR} && unzip -oq fast_update.zip && echo MAIN_OK")
run(f"cd {NODEJS_DIR}/node_modules && unzip -oq ../prisma_small.zip 2>/dev/null && echo PRISMA_OK")

# Verify engine type in client
run(f"grep -o '\"engineType\":\"[a-z]*\"' {NODEJS_DIR}/node_modules/.prisma/client/default.js 2>/dev/null | head -2 && echo VERIFY_OK")

# Copy static + public (best effort)
run(f"mkdir -p {PUBLIC_HTML}/_next && cp -rf {NODEJS_DIR}/.next/static {PUBLIC_HTML}/_next/ 2>&1 | tail -2; echo STATIC_OK")
run(f"cp -rf {NODEJS_DIR}/public/* {PUBLIC_HTML}/ 2>/dev/null; echo PUBLIC_OK")

# Clean zips
run(f"rm -f {NODEJS_DIR}/fast_update.zip {NODEJS_DIR}/prisma_small.zip")

# Restart
run(f"mkdir -p {NODEJS_DIR}/tmp && touch {NODEJS_DIR}/tmp/restart.txt && echo RESTART_OK")

client.close()
print("\nDONE")
