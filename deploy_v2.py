"""
Deploy v2: takes zip + uploads via FTP + triggers extraction via emergency_deploy.php
(no SSH dependency - emergency_deploy.php handles unzip + restart).
"""
import ftplib
import os
import sys
import urllib.request
import ssl
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

zip_file = "fast_update.zip"

print("Connecting to FTP...")
ftp = ftplib.FTP(host)
ftp.login(user, pasw)
ftp.voidcmd("TYPE I")
print(f"PWD: {ftp.pwd()}")

# Upload zip
filesize = os.path.getsize(zip_file)
print(f"Uploading {zip_file} ({filesize / 1024 / 1024:.2f} MB)...")

with open(zip_file, "rb") as f:
    last_pct = [0]
    def callback(data):
        callback.uploaded += len(data)
        pct = int((callback.uploaded / filesize) * 100)
        if pct >= last_pct[0] + 10:
            sys.stdout.write(f"\r{pct}% ")
            sys.stdout.flush()
            last_pct[0] = pct
    callback.uploaded = 0
    ftp.storbinary("STOR fast_update.zip", f, blocksize=1024*1024, callback=callback)
print("\nUploaded zip")

# Make sure emergency_deploy.php is present
need_emergency = True
try:
    files = ftp.nlst()
    if "emergency_deploy.php" in files:
        need_emergency = False
except:
    pass

if need_emergency:
    print("Uploading emergency_deploy.php...")
    with open("emergency_deploy.php", "rb") as f:
        ftp.storbinary("STOR emergency_deploy.php", f)
    print("Uploaded emergency_deploy.php")

ftp.quit()

# Trigger extraction
print("\nTriggering extraction via emergency_deploy.php...")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request(
        "https://morsall.com/emergency_deploy.php?v=2026",
        headers={"User-Agent": "Mozilla/5.0"}
    )
    res = urllib.request.urlopen(req, context=ctx, timeout=180)
    body = res.read().decode("utf-8", errors="ignore")
    print(body)
except Exception as e:
    print(f"Extract error: {e}")
    if hasattr(e, 'read'):
        try:
            print(e.read().decode("utf-8", errors="ignore")[:2000])
        except:
            pass

print("DONE")
