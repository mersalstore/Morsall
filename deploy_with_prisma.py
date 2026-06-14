"""
Deploy that ALSO uploads the freshly generated Prisma client (node_modules/.prisma/client/)
so the production gets a client with engineType=binary baked in.
"""
import ftplib
import io
import os
import sys
import time
import urllib.request
import ssl
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

# === Step 1: Upload zip via FTP ===
print("=== Step 1: Upload main zip ===")
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")

filesize = os.path.getsize("fast_update.zip")
print(f"Uploading fast_update.zip ({filesize / 1024 / 1024:.2f} MB)...")
with open("fast_update.zip", "rb") as f:
    last_pct = [0]
    def cb(data):
        cb.uploaded += len(data)
        pct = int((cb.uploaded / filesize) * 100)
        if pct >= last_pct[0] + 20:
            sys.stdout.write(f"\r{pct}% ")
            sys.stdout.flush()
            last_pct[0] = pct
    cb.uploaded = 0
    ftp.storbinary("STOR fast_update.zip", f, blocksize=1024*1024, callback=cb)
print("\nUploaded.")

# === Step 2: Also upload the freshly built Prisma client ===
# We zip just the .prisma folder
print("\n=== Step 2: Zip + upload Prisma client ===")
import zipfile
prisma_zip = "prisma_client.zip"
with zipfile.ZipFile(prisma_zip, 'w', zipfile.ZIP_DEFLATED) as z:
    src_dir = os.path.join("node_modules", ".prisma", "client")
    for root, _, files in os.walk(src_dir):
        for f in files:
            full = os.path.join(root, f)
            # Skip Windows-only or temp engine files (saves bandwidth)
            if "query-engine-windows" in f or ".tmp" in f:
                continue
            rel = os.path.relpath(full, "node_modules")
            z.write(full, rel)
print(f"Created {prisma_zip} ({os.path.getsize(prisma_zip) / 1024 / 1024:.2f} MB)")

ftp.voidcmd("TYPE I")
psize = os.path.getsize(prisma_zip)
with open(prisma_zip, "rb") as f:
    last_pct2 = [0]
    def cb2(data):
        cb2.uploaded += len(data)
        pct = int((cb2.uploaded / psize) * 100)
        if pct >= last_pct2[0] + 20:
            sys.stdout.write(f"\r{pct}% ")
            sys.stdout.flush()
            last_pct2[0] = pct
    cb2.uploaded = 0
    ftp.storbinary(f"STOR {prisma_zip}", f, blocksize=1024*1024, callback=cb2)
print("\nUploaded prisma_client.zip")
ftp.quit()

# === Step 3: Extract via SSH ===
print("\n=== Step 3: Extract everything + restart ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS, timeout=20)

def run(cmd, timeout=180):
    print(f"$ {cmd[:200]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print(f"STDERR: {err}")

# Move both zips to nodejs and extract
run(f"mv {PUBLIC_HTML}/fast_update.zip {NODEJS_DIR}/ && mv {PUBLIC_HTML}/prisma_client.zip {NODEJS_DIR}/ && echo MOVED")
run(f"cd {NODEJS_DIR} && unzip -oq fast_update.zip && echo MAIN_EXTRACTED")
run(f"cd {NODEJS_DIR}/node_modules && unzip -oq ../prisma_client.zip && echo PRISMA_EXTRACTED")

# Copy static to public_html (best effort)
run(f"mkdir -p {PUBLIC_HTML}/_next && cp -rf {NODEJS_DIR}/.next/static {PUBLIC_HTML}/_next/ 2>&1 | head -3; echo STATIC_DONE")
run(f"cp -rf {NODEJS_DIR}/public/* {PUBLIC_HTML}/ 2>/dev/null; echo PUBLIC_DONE")

# Cleanup zips
run(f"rm -f {NODEJS_DIR}/fast_update.zip {NODEJS_DIR}/prisma_client.zip {PUBLIC_HTML}/fast_update.zip {PUBLIC_HTML}/prisma_client.zip")

# Verify Prisma client engine type
run(f"grep -c 'binary' {NODEJS_DIR}/node_modules/.prisma/client/default.js 2>&1 | head -3")

# Touch restart
run(f"mkdir -p {NODEJS_DIR}/tmp && touch {NODEJS_DIR}/tmp/restart.txt && echo RESTART_TRIGGERED")

client.close()
print("\nDONE")
