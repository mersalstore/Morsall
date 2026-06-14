"""
Deploy with Passenger temporarily disabled.
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
print(f"FTP connected at /public_html")

# Step 1: Replace htaccess to free PHP
print("\n1) Replacing .htaccess with empty version (Passenger disabled)...")
ftp.storbinary("STOR .htaccess", io.BytesIO(EMPTY_HTACCESS.encode("utf-8")))

# Wait for Passenger to drop
time.sleep(6)

# Step 2: Call emergency_deploy.php to extract
print("\n2) Calling emergency_deploy.php...")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

success = False
for attempt in range(3):
    try:
        req = urllib.request.Request(
            "https://morsall.com/emergency_deploy.php?v=2026",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        res = urllib.request.urlopen(req, context=ctx, timeout=180)
        body = res.read().decode("utf-8", errors="ignore")
        print(f"Attempt {attempt+1} - Status: {res.status}")
        print(body)
        success = True
        break
    except Exception as e:
        print(f"Attempt {attempt+1} error: {e}")
        if hasattr(e, 'read'):
            try:
                print(e.read().decode("utf-8", errors="ignore")[:600])
            except:
                pass
        time.sleep(10)

# Step 3: Restore htaccess
print("\n3) Restoring original .htaccess...")
ftp.storbinary("STOR .htaccess", io.BytesIO(ORIG_HTACCESS.encode("utf-8")))

# Step 4: re-apply PRISMA binary engine in .env (since extraction may have changed it)
print("\n4) Re-applying binary engine to .env...")
try:
    ftp.cwd("/nodejs")
    buf = io.BytesIO()
    ftp.retrbinary("RETR .env", buf.write)
    env_content = buf.getvalue().decode("utf-8", errors="ignore")
    import re
    if "PRISMA_CLIENT_ENGINE_TYPE" not in env_content:
        env_content = env_content.rstrip("\n") + "\nPRISMA_CLIENT_ENGINE_TYPE=binary\n"
    else:
        env_content = re.sub(r'^PRISMA_CLIENT_ENGINE_TYPE\s*=.*$', 'PRISMA_CLIENT_ENGINE_TYPE=binary', env_content, flags=re.MULTILINE)
    ftp.storbinary("STOR .env", io.BytesIO(env_content.encode("utf-8")))
    print("   Updated .env with binary engine setting")
except Exception as e:
    print(f"   .env update error: {e}")

# Step 5: Touch restart
print("\n5) Touching nodejs/tmp/restart.txt...")
try:
    ftp.cwd("/nodejs/tmp")
    ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
    print("   Touched restart.txt")
except Exception as e:
    print(f"   restart error: {e}")

ftp.quit()
print("\nDONE")
