import os
import zipfile
import paramiko
import time
import ftplib

# --- Configuration ---
SSH_HOST = '82.198.228.182'
SSH_PORT = 65002
SSH_USER = 'u754458241'
SSH_PASS = '@n9qe3KgL'

FTP_HOST = '82.198.228.182'
FTP_USER = 'u754458241.morsall.com'
FTP_PASS = 'l$9Qs3i]g0y]/V~k'

TARGET_DIRS = [
    'domains/morsall.com/public_html/app_new',
    'domains/morsall.com/nodejs'
]

ZIP_NAME = "comprehensive_deploy.zip"

def create_zip():
    print("Creating comprehensive deployment zip...")
    dirs_to_zip = ['.next', '_next', 'public', 'src', 'prisma']
    files_to_zip = [
        'server-hostinger.js', 
        '.env.production', 
        'package.json', 
        'next.config.js', 
        'server.js', 
        '.htaccess',
        'start_morsall.js'
    ]
    
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for d in dirs_to_zip:
            if os.path.exists(d):
                for root, _, files in os.walk(d):
                    if 'cache' in root and '.next' in root: continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, os.getcwd())
                        zipf.write(file_path, arc_name)
        for f in files_to_zip:
            if os.path.exists(f):
                zipf.write(f, f)
    print(f"Created {ZIP_NAME} ({os.path.getsize(ZIP_NAME)//1024} KB)")

def deploy_to_dir(target_dir):
    print(f"\n--- Deploying to {target_dir} ---")
    
    # Upload via FTP (more reliable for large files)
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        remote_path = f"{target_dir}/{ZIP_NAME}"
        print(f"Uploading via FTP to {remote_path}...")
        with open(ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {remote_path}", f)
        ftp.quit()
    except Exception as e:
        print(f"FTP Upload Failed: {e}")
        return

    # Extract via SSH
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS)
        print("SSH Connected.")
        
        cmds = [
            f"cd {target_dir} && unzip -o {ZIP_NAME}",
            f"cd {target_dir} && mkdir -p tmp && touch tmp/restart.txt",
            f"cd {target_dir} && rm {ZIP_NAME}"
        ]
        
        for cmd in cmds:
            print(f"Running: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout.read() # wait for completion
        
        client.close()
        print(f"Deployment to {target_dir} successful!")
    except Exception as e:
        print(f"SSH Command Failed: {e}")

if __name__ == "__main__":
    create_zip()
    for d in TARGET_DIRS:
        deploy_to_dir(d)
    print("\nAll deployments finished!")
