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
EMPTY_HTACCESS = "# temp\n"

ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")
print(f"PWD: {ftp.pwd()}")

# Upload zip fresh (in case it was deleted)
size = os.path.getsize("fast_update.zip")
print(f"Uploading fast_update.zip ({size/1024/1024:.2f} MB)...")
with open("fast_update.zip", "rb") as f:
    last = [0]
    def cb(data):
        cb.up += len(data)
        pct = int((cb.up/size)*100)
        if pct >= last[0]+25:
            sys.stdout.write(f"\r {pct}% "); sys.stdout.flush(); last[0]=pct
    cb.up = 0
    ftp.storbinary("STOR fast_update.zip", f, blocksize=1024*1024, callback=cb)
print("\nUploaded zip")

# Upload force_extract.php
with open("force_extract.php", "rb") as f:
    ftp.storbinary("STOR force_extract.php", f)
print("Uploaded force_extract.php")

# Disable passenger so PHP runs
ftp.storbinary("STOR .htaccess", io.BytesIO(EMPTY_HTACCESS.encode()))
print("Disabled Passenger")
ftp.quit()

time.sleep(8)

# Call force_extract.php
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
for attempt in range(4):
    try:
        req = urllib.request.Request("https://morsall.com/force_extract.php?v=forceextract2026", headers={"User-Agent":"Mozilla/5.0"})
        res = urllib.request.urlopen(req, context=ctx, timeout=300)
        print(res.read().decode("utf-8", errors="ignore"))
        break
    except Exception as e:
        print(f"Attempt {attempt+1}: {e}")
        time.sleep(12)

# Cleanup force_extract.php
try:
    ftp = ftplib.FTP(FTP_HOST); ftp.login(FTP_USER, FTP_PASS)
    ftp.delete("force_extract.php")
    print("Deleted force_extract.php")
    ftp.quit()
except Exception as e:
    print(f"cleanup: {e}")

print("DONE")
