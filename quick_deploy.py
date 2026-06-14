"""
Quick deploy: zip .next + src + public + prisma then upload and restart.
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

zip_path = 'fast_update.zip'
print('=== Step 1: Create zip ===')
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    # Next.js built output (no cache)
    for root, dirs, files in os.walk('.next'):
        dirs[:] = [d for d in dirs if d not in ['cache']]
        for f in files:
            fp = os.path.join(root, f)
            zf.write(fp, fp.replace('\\', '/'))
    # src
    for root, dirs, files in os.walk('src'):
        for f in files:
            fp = os.path.join(root, f)
            zf.write(fp, fp.replace('\\', '/'))
    # public
    for root, dirs, files in os.walk('public'):
        for f in files:
            fp = os.path.join(root, f)
            zf.write(fp, fp.replace('\\', '/'))
    # prisma
    for root, dirs, files in os.walk('prisma'):
        for f in files:
            fp = os.path.join(root, f)
            zf.write(fp, fp.replace('\\', '/'))
    # configs
    for fname in ['package.json', 'next.config.js', 'server.js', '.htaccess']:
        if os.path.exists(fname):
            zf.write(fname)

size = os.path.getsize(zip_path)
print(f'Zip ready: {size/1024/1024:.1f} MB')

print('\n=== Step 2: FTP Upload ===')
ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)
ftp.voidcmd("TYPE I")
uploaded = [0]
def cb(data):
    uploaded[0] += len(data)
    pct = int((uploaded[0] / size) * 100)
    if pct % 20 == 0:
        sys.stdout.write(f'\r  {pct}%  ')
        sys.stdout.flush()
with open(zip_path, 'rb') as f:
    ftp.storbinary(f'STOR {zip_path}', f, blocksize=1024*1024, callback=cb)
print('\n  Upload done.')
ftp.quit()

print('\n=== Step 3: SSH Extract + Restart ===')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS, timeout=20)

def run(cmd):
    print(f'$ {cmd[:100]}')
    _, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out: print(out[:300])
    if err and 'Permission denied' not in err: print(f'ERR: {err[:200]}')

run(f'mv {PUBLIC_HTML}/{zip_path} {NODEJS_DIR}/ && echo MOVED')
run(f'cd {NODEJS_DIR} && unzip -oq {zip_path} && echo EXTRACTED')
run(f'mkdir -p {PUBLIC_HTML}/_next && cp -rf {NODEJS_DIR}/.next/static {PUBLIC_HTML}/_next/ && echo STATIC_OK')
run(f'cp -rf {NODEJS_DIR}/public/* {PUBLIC_HTML}/ && echo PUBLIC_OK')
run(f'rm -f {NODEJS_DIR}/{zip_path}')
run(f'mkdir -p {NODEJS_DIR}/tmp && touch {NODEJS_DIR}/tmp/restart.txt && echo RESTART_OK')

client.close()
print('\n=== DONE ===')
