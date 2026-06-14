"""
Re-upload force_extract.php (and zip if missing) and call it WITHOUT disabling
Passenger — PHP runs fine with Passenger enabled. Retries with long waits.
"""
import ftplib
import os
import sys
import time
import urllib.request
import ssl
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")

# Check if zip exists on server
zip_present = False
try:
    files = ftp.nlst()
    zip_present = "fast_update.zip" in files
except:
    pass

if not zip_present:
    size = os.path.getsize("fast_update.zip")
    print(f"Zip missing on server, uploading ({size/1024/1024:.2f} MB)...")
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
else:
    print("Zip already on server")

# Upload force_extract.php
with open("force_extract.php", "rb") as f:
    ftp.storbinary("STOR force_extract.php", f)
print("Uploaded force_extract.php")
ftp.quit()

# Call it (Passenger stays ON - PHP works fine). Retry with long waits.
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
ok = False
for attempt in range(6):
    try:
        req = urllib.request.Request("https://morsall.com/force_extract.php?v=forceextract2026", headers={"User-Agent":"Mozilla/5.0"})
        res = urllib.request.urlopen(req, context=ctx, timeout=300)
        body = res.read().decode("utf-8", errors="ignore")
        print(body)
        ok = True
        break
    except Exception as e:
        print(f"Attempt {attempt+1}: {e}")
        time.sleep(20)

# Cleanup
try:
    ftp = ftplib.FTP(FTP_HOST); ftp.login(FTP_USER, FTP_PASS)
    ftp.delete("force_extract.php")
    ftp.quit()
    print("Deleted force_extract.php")
except: pass

print("OK" if ok else "FAILED")
