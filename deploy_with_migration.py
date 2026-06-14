"""
Deploy: upload zip + migration PHP, disable passenger briefly to allow PHP serving,
run migration, run extraction, restore .htaccess, restart.
"""
import ftplib
import os
import sys
import time
import urllib.request
import ssl
import io
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

ORIG_HTACCESS = open("public_htaccess.txt", "r", encoding="utf-8").read()
EMPTY_HTACCESS = "# Temporarily empty to allow PHP serving\n"

print("=== Step 1: Upload zip + migration PHP ===")
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")

size = os.path.getsize("fast_update.zip")
print(f"Uploading fast_update.zip ({size/1024/1024:.2f} MB)...")
with open("fast_update.zip", "rb") as f:
    last = [0]
    def cb(data):
        cb.up += len(data)
        pct = int((cb.up / size) * 100)
        if pct >= last[0] + 25:
            sys.stdout.write(f"\r  {pct}% ")
            sys.stdout.flush()
            last[0] = pct
    cb.up = 0
    ftp.storbinary("STOR fast_update.zip", f, blocksize=1024*1024, callback=cb)
print("\nDone.")

print("\nUploading add_tx_columns.php...")
with open("add_tx_columns.php", "rb") as f:
    ftp.storbinary("STOR add_tx_columns.php", f)
print("Done.")

# Make sure emergency_deploy.php is present (it's needed for extraction)
try:
    files = ftp.nlst()
    if "emergency_deploy.php" not in files:
        with open("emergency_deploy.php", "rb") as f:
            ftp.storbinary("STOR emergency_deploy.php", f)
        print("Uploaded emergency_deploy.php (missing).")
except:
    pass

print("\n=== Step 2: Disable Passenger (.htaccess empty) ===")
ftp.storbinary("STOR .htaccess", io.BytesIO(EMPTY_HTACCESS.encode("utf-8")))
ftp.quit()

time.sleep(8)

print("\n=== Step 3: Run migration (add columns to PaymentTransaction) ===")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for attempt in range(3):
    try:
        req = urllib.request.Request(
            "https://morsall.com/add_tx_columns.php?v=addcols2026vixcell",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        res = urllib.request.urlopen(req, context=ctx, timeout=60)
        body = res.read().decode("utf-8", errors="ignore")
        print(f"Status: {res.status}")
        print(body)
        break
    except Exception as e:
        print(f"Attempt {attempt+1} migration error: {e}")
        time.sleep(10)

print("\n=== Step 4: Run emergency_deploy.php (extract zip) ===")
for attempt in range(3):
    try:
        req = urllib.request.Request(
            "https://morsall.com/emergency_deploy.php?v=2026",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        res = urllib.request.urlopen(req, context=ctx, timeout=180)
        body = res.read().decode("utf-8", errors="ignore")
        print(f"Status: {res.status}")
        clean = re.sub(r'<[^>]+>', '', body)
        print(clean[-2500:])
        break
    except Exception as e:
        print(f"Attempt {attempt+1} deploy error: {e}")
        time.sleep(10)

print("\n=== Step 5: Restore .htaccess + ensure binary engine in .env + delete migration PHP ===")
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.cwd("/public_html")
ftp.storbinary("STOR .htaccess", io.BytesIO(ORIG_HTACCESS.encode("utf-8")))
print("Restored .htaccess")

# Clean up migration PHP
try:
    ftp.delete("add_tx_columns.php")
    print("Deleted add_tx_columns.php")
except Exception as e:
    print(f"Skip delete: {e}")

# Verify .env has binary engine
try:
    ftp.cwd("/nodejs")
    buf = io.BytesIO()
    ftp.retrbinary("RETR .env", buf.write)
    env_content = buf.getvalue().decode("utf-8", errors="ignore")
    if "PRISMA_CLIENT_ENGINE_TYPE" not in env_content:
        env_content = env_content.rstrip("\n") + "\nPRISMA_CLIENT_ENGINE_TYPE=binary\n"
    else:
        env_content = re.sub(r'^PRISMA_CLIENT_ENGINE_TYPE\s*=.*$', 'PRISMA_CLIENT_ENGINE_TYPE=binary', env_content, flags=re.MULTILINE)
    ftp.storbinary("STOR .env", io.BytesIO(env_content.encode("utf-8")))
    print("Verified PRISMA_CLIENT_ENGINE_TYPE=binary")
except Exception as e:
    print(f"env update: {e}")

# Touch restart
try:
    ftp.cwd("/nodejs/tmp")
    ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
    print("Touched restart.txt")
except Exception as e:
    print(f"restart: {e}")

ftp.quit()
print("\nDONE")
