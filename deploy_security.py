"""
Deploy: FTP upload .next/server + manifests + middleware + migration PHP, run migration, touch restart.
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

REMOTE_BASE = "/nodejs/.next/server"
LOCAL_BASE = os.path.join(".next", "server")

ftp = ftplib.FTP(FTP_HOST, timeout=60)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")

made_dirs = set()
def ensure_dir(remote_dir):
    if remote_dir in made_dirs: return
    parts = remote_dir.strip("/").split("/")
    path = ""
    for p in parts:
        path += "/" + p
        if path in made_dirs: continue
        try: ftp.mkd(path)
        except: pass
        made_dirs.add(path)

# Upload .next/server
print("=== Upload .next/server ===")
uploaded = errors = 0
for root, _, files in os.walk(LOCAL_BASE):
    rel = os.path.relpath(root, LOCAL_BASE).replace("\\", "/")
    rd = REMOTE_BASE if rel == "." else f"{REMOTE_BASE}/{rel}"
    ensure_dir(rd)
    for f in files:
        try:
            with open(os.path.join(root, f), "rb") as fp:
                ftp.storbinary(f"STOR {rd}/{f}", fp)
            uploaded += 1
            if uploaded % 50 == 0: print(f"  ...{uploaded}")
        except Exception as e:
            errors += 1
print(f"\nUploaded server: {uploaded} | Errors: {errors}")

# Root manifests
print("\n=== Upload root .next files ===")
for fname in ["BUILD_ID", "prerender-manifest.json", "routes-manifest.json",
              "build-manifest.json", "app-build-manifest.json",
              "app-path-routes-manifest.json", "required-server-files.json",
              "react-loadable-manifest.json"]:
    lp = os.path.join(".next", fname)
    if os.path.exists(lp):
        try:
            with open(lp, "rb") as f:
                ftp.storbinary(f"STOR /nodejs/.next/{fname}", f)
            print(f"  {fname}")
        except Exception as e:
            print(f"  ERR {fname}: {e}")

# Upload migration PHP to /public_html
print("\n=== Upload migration PHP ===")
ftp.cwd("/public_html")
with open("add_security_tables.php", "rb") as f:
    ftp.storbinary("STOR add_security_tables.php", f)
print("  Uploaded add_security_tables.php")

ftp.quit()

# Run migration
print("\n=== Run migration ===")
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
ok = False
for attempt in range(4):
    try:
        req = urllib.request.Request("https://morsall.com/add_security_tables.php?v=sec2026vixcell",
                                     headers={"User-Agent": "Mozilla/5.0"})
        res = urllib.request.urlopen(req, context=ctx, timeout=60)
        print(res.read().decode("utf-8", errors="ignore"))
        ok = True
        break
    except Exception as e:
        print(f"Attempt {attempt+1}: {e}")
        time.sleep(15)

# Cleanup + restart
ftp = ftplib.FTP(FTP_HOST); ftp.login(FTP_USER, FTP_PASS)
try:
    ftp.cwd("/public_html")
    ftp.delete("add_security_tables.php")
    print("Deleted migration PHP")
except: pass

try:
    ftp.cwd("/nodejs/tmp")
    ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
    print("Touched restart.txt")
except Exception as e:
    print(f"restart: {e}")
ftp.quit()

print(f"\n{'DONE' if ok else 'PARTIAL (migration may have failed)'}")
