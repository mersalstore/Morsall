import ftplib
import os
import sys

def upload_dir(ftp, local_dir, remote_dir):
    try:
        ftp.mkd(remote_dir)
    except Exception:
        pass # Already exists
    
    ftp.cwd(remote_dir)
    
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        if os.path.isfile(local_path):
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {item}', f)
                print(f"Uploaded: {remote_dir}/{item}")
        elif os.path.isdir(local_path):
            upload_dir(ftp, local_path, item)
            ftp.cwd('..')

def main():
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    
    # Upload to app_new
    try:
        ftp.cwd('app_new')
    except Exception:
        ftp.mkd('app_new')
        ftp.cwd('app_new')

    # Upload Prisma schema
    print("Uploading schema.prisma...")
    try: ftp.mkd('prisma')
    except: pass
    ftp.cwd('prisma')
    with open('prisma/schema.prisma', 'rb') as f:
        ftp.storbinary('STOR schema.prisma', f)
    ftp.cwd('..')
    
    # Upload server-hostinger.js
    print("Uploading server-hostinger.js...")
    with open('server-hostinger.js', 'rb') as f:
        ftp.storbinary('STOR server-hostinger.js', f)
        
    # Upload .next/server (where the compiled session.ts and dashboard live)
    print("Uploading .next/server...")
    try: ftp.mkd('.next')
    except: pass
    ftp.cwd('.next')
    upload_dir(ftp, '.next/server', 'server')
    ftp.cwd('..')
    
    # Upload node_modules/.prisma
    print("Uploading node_modules/.prisma...")
    try: ftp.mkd('node_modules')
    except: pass
    ftp.cwd('node_modules')
    upload_dir(ftp, 'node_modules/.prisma', '.prisma')
    upload_dir(ftp, 'node_modules/@prisma', '@prisma')
    
    ftp.quit()
    print("All files uploaded!")

if __name__ == '__main__':
    main()
