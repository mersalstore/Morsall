"""
Deploy via FTP + emergency_deploy.php (no SSH dependency).
The zip now contains node_modules/.prisma/client/* paths too, so they get extracted properly.
"""
import ftplib
import os
import sys
import time
import urllib.request
import ssl
import io

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

ORIG_HTACCESS = open("public_htaccess.txt", "r", encoding="utf-8").read()
EMPTY_HTACCESS = "# Temporarily empty to allow PHP serving\n"

print("=== FTP: Upload fast_update.zip ===")
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
try:
    ftp.cwd("/public_html")
except Exception:
    try:
        ftp.cwd("public_html")
    except Exception:
        pass
ftp.voidcmd("TYPE I")

size = os.path.getsize("fast_update.zip")
print(f"Size: {size/1024/1024:.2f} MB")
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
print("\nUploaded fast_update.zip.")

# Upload updated emergency_deploy.php
print("\n=== FTP: Upload emergency_deploy.php ===")
with open("emergency_deploy.php", "rb") as f:
    ftp.storbinary("STOR emergency_deploy.php", f)
print("Uploaded emergency_deploy.php.")

# Replace htaccess to free PHP
print("\n=== Disable Passenger (.htaccess empty) ===")
ftp.storbinary("STOR .htaccess", io.BytesIO(EMPTY_HTACCESS.encode("utf-8")))

ftp.quit()

# Wait for Passenger to drop
time.sleep(8)

# Call emergency_deploy.php
print("\n=== Calling emergency_deploy.php ===")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

success = False
for attempt in range(4):
    try:
        req = urllib.request.Request(
            "https://morsall.com/emergency_deploy.php?v=2026",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        res = urllib.request.urlopen(req, context=ctx, timeout=180)
        body = res.read().decode("utf-8", errors="ignore")
        print(f"Attempt {attempt+1} - Status: {res.status}")
        # Strip HTML for readability
        import re
        clean = re.sub(r'<[^>]+>', '', body)
        print(clean)
        success = True
        break
    except Exception as e:
        print(f"Attempt {attempt+1} error: {e}")
        if hasattr(e, 'read'):
            try:
                print(e.read().decode("utf-8", errors="ignore")[:400])
            except:
                pass
        time.sleep(10)

# Restore .htaccess
print("\n=== Restore original .htaccess ===")
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
try:
    ftp.cwd("/public_html")
except Exception:
    try:
        ftp.cwd("public_html")
    except Exception:
        pass
ftp.storbinary("STOR .htaccess", io.BytesIO(ORIG_HTACCESS.encode("utf-8")))

# Make sure .env still has PRISMA_CLIENT_ENGINE_TYPE=library (might be needed as backup)
try:
    ftp.cwd("/nodejs")
    buf = io.BytesIO()
    ftp.retrbinary("RETR .env", buf.write)
    env_content = buf.getvalue().decode("utf-8", errors="ignore")
    if "PRISMA_CLIENT_ENGINE_TYPE" not in env_content:
        env_content = env_content.rstrip("\n") + "\nPRISMA_CLIENT_ENGINE_TYPE=library\n"
    else:
        import re
        env_content = re.sub(r'^PRISMA_CLIENT_ENGINE_TYPE\s*=.*$', 'PRISMA_CLIENT_ENGINE_TYPE=library', env_content, flags=re.MULTILINE)
    ftp.storbinary("STOR .env", io.BytesIO(env_content.encode("utf-8")))
    print("  .env has PRISMA_CLIENT_ENGINE_TYPE=library")
except Exception as e:
    print(f"  env update error: {e}")

# Trigger restart
try:
    ftp.cwd("/nodejs/tmp")
    ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
    print("  Touched restart.txt")
except Exception as e:
    print(f"  restart error: {e}")

ftp.quit()
print("\nDONE")
