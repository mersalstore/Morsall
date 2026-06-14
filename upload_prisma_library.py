"""
Upload the freshly generated Prisma client (library engine) to the server.
Only uploads .prisma/client and @prisma/client JS files (no binary engines).
"""
import zipfile, os, sys, ftplib, paramiko
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

SSH_HOST = '82.198.228.182'
SSH_PORT = 65002
SSH_USER = 'u754458241'
SSH_PASS = 'Vixcell.eg2'

NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'
PUBLIC_HTML = '/home/u754458241/domains/morsall.com/public_html'

zip_path = 'prisma_client_new.zip'

print('=== Step 1: Zip Prisma client JS files (no binaries) ===')

# Files to include from .prisma/client (JS only, no .node/.exe binaries)
JS_EXTS = {'.js', '.json', '.ts', '.d.ts', '.wasm'}

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    # .prisma/client - the auto-generated client
    base = os.path.join('node_modules', '.prisma', 'client')
    for root, dirs, files in os.walk(base):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in JS_EXTS or f in ('schema.prisma',):
                fp = os.path.join(root, f)
                arcname = fp.replace('\\', '/')
                zf.write(fp, arcname)
                
    # @prisma/client - the public API
    base2 = os.path.join('node_modules', '@prisma', 'client')
    for root, dirs, files in os.walk(base2):
        # skip node_modules inside it
        dirs[:] = [d for d in dirs if d not in ['node_modules']]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in JS_EXTS:
                fp = os.path.join(root, f)
                arcname = fp.replace('\\', '/')
                zf.write(fp, arcname)

size = os.path.getsize(zip_path)
print(f'Zip: {size/1024/1024:.2f} MB')

print('\n=== Step 2: FTP Upload ===')
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")
uploaded = [0]
def cb(data):
    uploaded[0] += len(data)
    pct = int((uploaded[0] / size) * 100)
    if pct % 25 == 0:
        sys.stdout.write(f'\r  {pct}%  ')
        sys.stdout.flush()
with open(zip_path, 'rb') as f:
    ftp.storbinary(f'STOR {zip_path}', f, blocksize=512*1024, callback=cb)
print('\n  Done.')
ftp.quit()

print('\n=== Step 3: SSH - Extract into node_modules ===')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS, timeout=20)

def run(cmd):
    print(f'$ {cmd[:120]}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out: print(out[:400])
    if err: print(f'ERR: {err[:300]}')

# Move zip to nodejs dir
run(f'mv {PUBLIC_HTML}/{zip_path} {NODEJS_DIR}/ && echo MOVED')

# Extract into node_modules (it will overwrite .prisma/client and @prisma/client files)
run(f'cd {NODEJS_DIR} && unzip -oq {zip_path} && echo EXTRACTED_OK')

# Verify the new engineType
run(f"grep -o 'engineType:\"[^\"]*\"' {NODEJS_DIR}/node_modules/.prisma/client/default.js 2>&1 | head -3 || echo '(not found - may be in index.js)'")
run(f"grep -o 'engineType:\"[^\"]*\"' {NODEJS_DIR}/node_modules/@prisma/client/default.js 2>&1 | head -3 || echo '(not found)'")

# Also verify schema still says library
run(f"head -5 {NODEJS_DIR}/prisma/schema.prisma 2>&1")

# Cleanup
run(f'rm -f {NODEJS_DIR}/{zip_path}')

# Restart
run(f'touch {NODEJS_DIR}/tmp/restart.txt && echo RESTART_OK')

ssh.close()
print('\n=== DONE ===')
