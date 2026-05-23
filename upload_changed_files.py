import ftplib
import os
import zipfile

print('Extracting fast_update.zip locally to identify changed files...')
changed_files = []
with zipfile.ZipFile('fast_update.zip', 'r') as z:
    changed_files = z.namelist()
    print(f'Total files in zip: {len(changed_files)}')

print('\nConnecting to FTP...')
ftp = ftplib.FTP('82.198.228.182')
ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')

def ensure_dir(ftp, path):
    parts = path.split('/')
    for i in range(1, len(parts)):
        partial = '/'.join(parts[:i])
        if partial:
            try:
                ftp.mkd(partial)
            except:
                pass

def upload_file(ftp, local_path, remote_path):
    remote_dir = '/'.join(remote_path.split('/')[:-1])
    if remote_dir:
        ensure_dir(ftp, 'domains/morsall.com/nodejs/' + remote_dir)
    
    try:
        ftp.cwd('/domains/morsall.com/nodejs/' + (remote_dir or ''))
        filename = remote_path.split('/')[-1]
        if os.path.exists(local_path) and os.path.isfile(local_path):
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {filename}', f)
    except Exception as e:
        pass
    finally:
        try:
            ftp.cwd('/')
        except:
            pass

priority_files = [f for f in changed_files if 
    f.startswith('.next/server/') or 
    f.startswith('.next/static/') or
    f == 'server-hostinger.js' or
    f.startswith('prisma/')]

print(f'\nUploading {len(priority_files)} priority files...')

count = 0
for fpath in priority_files:
    if not os.path.exists(fpath) or os.path.isdir(fpath):
        continue
    remote = fpath.replace('\\\\', '/')
    upload_file(ftp, fpath, remote)
    count += 1
    if count % 50 == 0:
        print(f'  Uploaded {count} files...')

print(f'\nDone! Uploaded {count} files')
ftp.quit()

