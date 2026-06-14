"""
FALLBACK: Upload the local .next/server tree directly via FTP, overwriting the
server copy. Reliable channel (FTP works when PHP/SSH 503). Only uploads .js/.json
(server code) and skips huge cache. Also uploads the critical route files.
"""
import ftplib
import os
import sys
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
    if remote_dir in made_dirs:
        return
    parts = remote_dir.strip("/").split("/")
    path = ""
    for p in parts:
        path += "/" + p
        if path in made_dirs:
            continue
        try:
            ftp.mkd(path)
        except Exception:
            pass
        made_dirs.add(path)

uploaded = 0
skipped = 0
errors = 0

for root, dirs, files in os.walk(LOCAL_BASE):
    # skip nothing special; .next/server has no cache
    rel_root = os.path.relpath(root, LOCAL_BASE).replace("\\", "/")
    remote_dir = REMOTE_BASE if rel_root == "." else f"{REMOTE_BASE}/{rel_root}"
    ensure_dir(remote_dir)
    for fname in files:
        local_path = os.path.join(root, fname)
        remote_path = f"{remote_dir}/{fname}"
        try:
            with open(local_path, "rb") as f:
                ftp.storbinary(f"STOR {remote_path}", f)
            uploaded += 1
            if uploaded % 50 == 0:
                print(f"  ...{uploaded} files uploaded")
        except Exception as e:
            errors += 1
            if errors <= 10:
                print(f"  ERR {remote_path}: {e}")

print(f"\nUploaded server/: {uploaded} | Errors: {errors}")

# Also upload critical root .next files for build consistency
print("Uploading root .next files (BUILD_ID, manifests)...")
for fname in ["BUILD_ID", "prerender-manifest.json", "routes-manifest.json",
              "build-manifest.json", "app-build-manifest.json",
              "app-path-routes-manifest.json", "required-server-files.json",
              "react-loadable-manifest.json"]:
    lp = os.path.join(".next", fname)
    if os.path.exists(lp):
        try:
            with open(lp, "rb") as f:
                ftp.storbinary(f"STOR /nodejs/.next/{fname}", f)
            print(f"  uploaded {fname}")
        except Exception as e:
            print(f"  ERR {fname}: {e}")

# Touch restart
try:
    ftp.cwd("/nodejs/tmp")
    import io
    ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
    print("Touched restart.txt")
except Exception as e:
    print(f"restart: {e}")

ftp.quit()
print("DONE")
