"""
Steps:
1. Replace .htaccess with PassengerEnabled off
2. Wait for Passenger to drop
3. Apply env fix via direct file write through FTP
4. Restore original .htaccess
5. Trigger restart
"""
import ftplib
import io
import time
import urllib.request
import ssl
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ORIG_HTACCESS = open("public_htaccess.txt", "r", encoding="utf-8").read()
DISABLED_HTACCESS = "PassengerEnabled off\n"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
ftp.cwd("/public_html")
print("FTP connected at /public_html")

# Step 1: Disable Passenger
print("\n1) Disabling Passenger in public_html/.htaccess...")
ftp.storbinary("STOR .htaccess", io.BytesIO(DISABLED_HTACCESS.encode("utf-8")))

# Step 2: Wait 4s for changes to propagate
time.sleep(4)

# Step 3: Call PHP fix
print("\n2) Calling fix_prisma_engine.php...")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
try:
    req = urllib.request.Request(
        "https://morsall.com/fix_prisma_engine.php?v=fix2026vixcell",
        headers={"User-Agent": "Mozilla/5.0"}
    )
    res = urllib.request.urlopen(req, context=ctx, timeout=60)
    print(res.read().decode("utf-8", errors="ignore"))
except Exception as e:
    print(f"Fix call error: {e}")
    # Try to read error body
    if hasattr(e, 'read'):
        try:
            print(e.read().decode("utf-8", errors="ignore"))
        except:
            pass

# Step 4: Restore original .htaccess
print("\n3) Restoring original .htaccess...")
ftp.storbinary("STOR .htaccess", io.BytesIO(ORIG_HTACCESS.encode("utf-8")))

# Step 5: Touch nodejs/tmp/restart.txt
print("\n4) Touching nodejs/tmp/restart.txt...")
ftp.cwd("/nodejs/tmp")
ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
ftp.quit()
print("DONE")
