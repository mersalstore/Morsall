"""
Upload the freshly binary-generated Prisma client JS to the server, and flip
both server .env files to PRISMA_CLIENT_ENGINE_TYPE=binary.
Skips the heavy engine binaries — the server already has query-engine-debian-openssl-1.1.x.
"""
import ftplib, os, io, re, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HOST, USER, PASW = "82.198.228.182", "u754458241.morsall.com", "l$9Qs3i]g0y]/V~k"
ftp = ftplib.FTP(HOST, timeout=90); ftp.login(USER, PASW); ftp.voidcmd("TYPE I")

made = set()
def ensure(d):
    if d in made: return
    p = ""
    for part in d.strip("/").split("/"):
        p += "/" + part
        if p in made: continue
        try: ftp.mkd(p)
        except: pass
        made.add(p)

# 1) Upload .prisma/client — JS/TS/json/schema only (skip .so.node, query-engine-*, .exe)
local = os.path.join("node_modules", ".prisma", "client")
remote = "/nodejs/node_modules/.prisma/client"
ensure(remote)
up = skip = 0
for root, _, files in os.walk(local):
    rel = os.path.relpath(root, local).replace("\\", "/")
    rd = remote if rel == "." else f"{remote}/{rel}"
    ensure(rd)
    for f in files:
        if f.endswith(".so.node") or f.startswith("query-engine-") or f.startswith("query_engine-") or f.endswith(".exe") or ".tmp" in f or f.endswith(".dll.node"):
            skip += 1; continue
        try:
            with open(os.path.join(root, f), "rb") as fp:
                ftp.storbinary(f"STOR {rd}/{f}", fp)
            up += 1
        except Exception as e:
            print("ERR", f, e)
print(f"client JS uploaded: {up} | skipped binaries: {skip}")

# 2) Flip both env files on server to binary
for envname in [".env", ".env.production"]:
    try:
        ftp.cwd("/nodejs")
        buf = io.BytesIO(); ftp.retrbinary(f"RETR {envname}", buf.write)
        t = buf.getvalue().decode("utf-8", "ignore")
        if "PRISMA_CLIENT_ENGINE_TYPE" in t:
            t = re.sub(r"PRISMA_CLIENT_ENGINE_TYPE\s*=\s*\S+", "PRISMA_CLIENT_ENGINE_TYPE=binary", t)
        else:
            t = t.rstrip("\n") + "\nPRISMA_CLIENT_ENGINE_TYPE=binary\n"
        ftp.storbinary(f"STOR /nodejs/{envname}", io.BytesIO(t.encode("utf-8")))
        print(f"{envname} -> binary")
    except Exception as e:
        print(f"{envname} env err:", e)

# 3) Confirm the binary query-engine exists on server
try:
    sz = ftp.size("/nodejs/node_modules/.prisma/client/query-engine-debian-openssl-1.1.x")
    print(f"server binary query-engine present: {sz} bytes")
except Exception as e:
    print("WARN binary engine missing:", e)

ftp.quit()
print("DONE")
