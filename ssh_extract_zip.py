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
for attempt in range(5):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        print(f"CONNECTED (attempt {attempt+1})")
        break
    except Exception as e:
        print(f"Attempt {attempt+1} failed: {e}")
        time.sleep(10)

if not client:
    sys.exit(1)

def run(cmd, timeout=120):
    print(f"$ {cmd[:200]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print(f"STDERR: {err}")
    return out, err

# Move zip from public_html to nodejs and extract it
print("\n=== Moving + extracting zip ===")
run(f"mv {PUBLIC_HTML}/fast_update.zip {NODEJS_DIR}/ 2>/dev/null; cd {NODEJS_DIR} && unzip -oq fast_update.zip && echo EXTRACTED_OK", timeout=180)

print("\n=== Copying _next/static to public_html ===")
run(f"mkdir -p {PUBLIC_HTML}/_next && cp -rf {NODEJS_DIR}/.next/static {PUBLIC_HTML}/_next/ && echo STATIC_COPIED")

print("\n=== Copying public/* to public_html ===")
run(f"cp -rf {NODEJS_DIR}/public/* {PUBLIC_HTML}/ 2>/dev/null || true; echo PUBLIC_COPIED")

print("\n=== Cleaning up zip ===")
run(f"rm -f {NODEJS_DIR}/fast_update.zip {PUBLIC_HTML}/fast_update.zip")

print("\n=== Triggering restart ===")
run(f"mkdir -p {NODEJS_DIR}/tmp && touch {NODEJS_DIR}/tmp/restart.txt && echo RESTART_OK")

client.close()
print("\nDONE")
