import os
import shutil
import zipfile
import ftplib
import paramiko

# --- Config ---
ZIP_NAME = "standalone_deploy.zip"
HOST = '82.198.228.182'
FTP_USER = 'u754458241.morsall.com'
FTP_PASS = 'l$9Qs3i]g0y]/V~k'
SSH_USER = 'u754458241'
SSH_PASS = '@n9qe3KgL'
REMOTE_DIR = '/home/u754458241/domains/morsall.com/nodejs'

def prepare_standalone():
    print("Preparing standalone folder...")
    standalone_path = ".next/standalone"
    if not os.path.exists(standalone_path):
        print("Error: standalone folder not found. Build failed?")
        return False
        
    # Copy public
    dest_public = os.path.join(standalone_path, "public")
    if os.path.exists(dest_public): shutil.rmtree(dest_public)
    shutil.copytree("public", dest_public)
    
    # Copy static
    dest_static = os.path.join(standalone_path, ".next", "static")
    if os.path.exists(dest_static): shutil.rmtree(dest_static)
    shutil.copytree(".next/static", dest_static)
    
    # Copy .env.production
    shutil.copy(".env.production", os.path.join(standalone_path, ".env.production"))
    
    print("Zipping...")
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(standalone_path):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, standalone_path))
    print(f"Created {ZIP_NAME}")
    return True

def upload_and_extract():
    print("Uploading via FTP...")
    try:
        ftp = ftplib.FTP(HOST)
        ftp.login(FTP_USER, FTP_PASS)
        # We can only upload to public_html via this FTP user
        with open(ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {ZIP_NAME}", f)
        ftp.quit()
        print("Upload to public_html complete.")
        
        print("Extracting via SSH...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=65002, username=SSH_USER, password=SSH_PASS)
        
        # Move zip to nodejs and unzip
        cmds = [
            f"mv /home/u754458241/domains/morsall.com/public_html/{ZIP_NAME} {REMOTE_DIR}/",
            f"cd {REMOTE_DIR} && unzip -o {ZIP_NAME}",
            f"cd {REMOTE_DIR} && mkdir -p tmp && touch tmp/restart.txt"
        ]
        for cmd in cmds:
            print(f"Running: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout.read()
            
        client.close()
        print("Deployment finished!")
    except Exception as e:
        print(f"Deployment failed: {e}")

if __name__ == "__main__":
    if prepare_standalone():
        upload_and_extract()
