"""
Deploy v3: main code + small Prisma client (JS only, no binaries).
The binary engines on the server are already there from previous builds.
"""
import ftplib
import os
import sys
import paramiko
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

SSH_HOST = '82.198.228.182'
SSH_PORT = 65002
SSH_USER = 'u754458241'
SSH_PASS = 'Vixcell.eg2'

NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'
PUBLIC_HTML = '/home/u754458241/domains/morsall.com/public_html'

print("=== FTP: Upload main zip + prisma_small.zip ===")
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")

for fname in ["fast_update.zip", "prisma_small.zip"]:
    size = os.path.getsize(fname)
    print(f"Uploading {fname} ({size / 1024 / 1024:.2f} MB)...")
    with open(fname, "rb") as f:
        last = [0]
        def cb(data):
            cb.up += len(data)
            pct = int((cb.up / size) * 100)
            if pct >= last[0] + 25:
                sys.stdout.write(f"\r  {pct}% ")
                sys.stdout.flush()
                last[0] = pct
        cb.up = 0
        ftp.storbinary(f"STOR {fname}", f, blocksize=1024*1024, callback=cb)
    print("\n  Done.")

ftp.quit()

print("\n=== SSH: Move + extract + restart ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS, timeout=20)

def run(cmd, timeout=180, redact=False):
    print(f"$ {cmd[:200]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if redact:
        import re
        out = re.sub(r'mysql://[^@\s]+@', 'mysql://[REDACTED]@', out)
    if out: print(out)
    if err: print(f"STDERR: {err[:500]}")

# Move zips into nodejs
run(f"mv {PUBLIC_HTML}/fast_update.zip {NODEJS_DIR}/ 2>/dev/null; mv {PUBLIC_HTML}/prisma_small.zip {NODEJS_DIR}/ 2>/dev/null; echo MOVED")

# Extract main zip (overwrites .next, src, prisma schema etc.)
run(f"cd {NODEJS_DIR} && unzip -oq fast_update.zip && echo MAIN_OK")

# Extract small prisma client zip into node_modules (overwrites .prisma/client JS files)
run(f"cd {NODEJS_DIR}/node_modules && unzip -oq ../prisma_small.zip 2>/dev/null && echo PRISMA_OK")

# Show that engineType is now binary in the generated client
run(f"grep -o '\"engineType\":\"[a-z]*\"' {NODEJS_DIR}/node_modules/.prisma/client/default.js 2>/dev/null | head -2")

# Static + public copies
run(f"mkdir -p {PUBLIC_HTML}/_next && cp -rf {NODEJS_DIR}/.next/static {PUBLIC_HTML}/_next/ 2>&1 | head -2; echo STATIC_OK")
run(f"cp -rf {NODEJS_DIR}/public/* {PUBLIC_HTML}/ 2>/dev/null; echo PUBLIC_OK")

# Cleanup zips
run(f"rm -f {NODEJS_DIR}/fast_update.zip {NODEJS_DIR}/prisma_small.zip")

# Restart
run(f"mkdir -p {NODEJS_DIR}/tmp && touch {NODEJS_DIR}/tmp/restart.txt && echo RESTART_OK")

client.close()
print("\nDONE")
