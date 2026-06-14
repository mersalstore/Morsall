"""
Try a more aggressive Passenger disable: use a totally empty .htaccess.
That lets LiteSpeed/Apache fall back to default static + PHP handling.
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
EMPTY_HTACCESS = "# Temporarily empty to allow PHP serving\n"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
ftp.cwd("/public_html")
print("FTP connected at /public_html")

print("\n1) Setting empty .htaccess (no Passenger directives)...")
ftp.storbinary("STOR .htaccess", io.BytesIO(EMPTY_HTACCESS.encode("utf-8")))

# Wait a moment + longer for Passenger to fully drop
time.sleep(6)

# Try call PHP — retry a couple times
print("\n2) Calling fix_prisma_engine.php (with retries)...")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

success = False
for attempt in range(3):
    try:
        req = urllib.request.Request(
            "https://morsall.com/fix_prisma_engine.php?v=fix2026vixcell",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        res = urllib.request.urlopen(req, context=ctx, timeout=90)
        body = res.read().decode("utf-8", errors="ignore")
        print(f"Attempt {attempt+1} - Status: {res.status}")
        print(body)
        success = True
        break
    except Exception as e:
        print(f"Attempt {attempt+1} - error: {e}")
        if hasattr(e, 'read'):
            try:
                err_body = e.read().decode("utf-8", errors="ignore")[:500]
                print(err_body)
            except:
                pass
        time.sleep(10)

if not success:
    print("All attempts failed.")

# Restore original .htaccess
print("\n3) Restoring original .htaccess...")
ftp.storbinary("STOR .htaccess", io.BytesIO(ORIG_HTACCESS.encode("utf-8")))

# Touch restart
print("\n4) Touching nodejs/tmp/restart.txt...")
ftp.cwd("/nodejs/tmp")
ftp.storbinary("STOR restart.txt", io.BytesIO(b""))

ftp.quit()
print("DONE")
