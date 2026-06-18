"""
Full FTP deploy: uploads BOTH
  .next/server  -> /nodejs/.next/server      (server code)
  .next/static  -> /nodejs/.next/static AND /public_html/_next/static  (browser chunks)
plus root manifests + BUILD_ID. Then touches restart.txt.

Uploading static chunks is essential: a fresh build changes chunk filenames, and
the browser 404s on missing chunks -> white screen.
"""
import ftplib
import os
import io
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOST = "82.198.228.182"
USER = "u754458241.morsall.com"
PASW = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(HOST, timeout=90)
ftp.login(USER, PASW)
ftp.voidcmd("TYPE I")

made = set()
def ensure(remote_dir):
    if remote_dir in made:
        return
    path = ""
    for p in remote_dir.strip("/").split("/"):
        path += "/" + p
        if path in made:
            continue
        try:
            ftp.mkd(path)
        except Exception:
            pass
        made.add(path)

def upload_tree(local_base, remote_base, label):
    up = err = 0
    for root, _, files in os.walk(local_base):
        rel = os.path.relpath(root, local_base).replace("\\", "/")
        rd = remote_base if rel == "." else f"{remote_base}/{rel}"
        ensure(rd)
        for f in files:
            try:
                with open(os.path.join(root, f), "rb") as fp:
                    ftp.storbinary(f"STOR {rd}/{f}", fp)
                up += 1
                if up % 100 == 0:
                    print(f"  [{label}] {up}...")
            except Exception as e:
                err += 1
                if err <= 5:
                    print(f"  [{label}] ERR {f}: {e}")
    print(f"[{label}] uploaded {up} | errors {err}")
    return up, err

print("=== 1/4 .next/server ===")
upload_tree(os.path.join(".next", "server"), "/domains/morsall.com/nodejs/.next/server", "server")

print("\n=== 2/4 .next/static -> /domains/morsall.com/nodejs/.next/static ===")
upload_tree(os.path.join(".next", "static"), "/domains/morsall.com/nodejs/.next/static", "static-node")

print("\n=== 3/4 .next/static -> /public_html/_next/static (browser) ===")
upload_tree(os.path.join(".next", "static"), "/public_html/_next/static", "static-pub")

print("\n=== 4/4 root manifests ===")
for fname in ["BUILD_ID", "prerender-manifest.json", "routes-manifest.json",
              "build-manifest.json", "app-build-manifest.json",
              "app-path-routes-manifest.json", "required-server-files.json",
              "react-loadable-manifest.json"]:
    lp = os.path.join(".next", fname)
    if os.path.exists(lp):
        try:
            with open(lp, "rb") as f:
                ftp.storbinary(f"STOR /domains/morsall.com/nodejs/.next/{fname}", f)
            print(f"  {fname}")
        except Exception as e:
            print(f"  ERR {fname}: {e}")

# restart
try:
    ftp.cwd("/domains/morsall.com/nodejs/tmp")
    ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
    print("\nTouched restart.txt")
except Exception as e:
    print(f"restart err: {e}")

ftp.quit()
print("DONE")
