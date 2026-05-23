import os
import zipfile
import paramiko
import time

# --- Configuration ---
SSH_HOST = '82.198.228.182'
SSH_PORT = 65002
SSH_USER = 'u754458241'
SSH_PASS = '@n9qe3KgL'

REMOTE_APP_DIR = 'domains/morsall.com/public_html/app_new'
REMOTE_NODE_MODULES = '/home/u754458241/nodeapp/node_modules'

ZIP_NAME = "deploy_morsall.zip"
FIX_ZIP_NAME = "styled_jsx_fix.zip"

def create_zips():
    print("Creating main deployment zip...")
    dirs_to_zip = ['.next', '_next', 'public', 'src']
    files_to_zip = ['server-hostinger.js', '.env.production', 'package.json', 'next.config.js', 'app.js', '.htaccess']
    
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for d in dirs_to_zip:
            if os.path.exists(d):
                for root, _, files in os.walk(d):
                    if '.next' in root and 'cache' in root:
                        continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, os.getcwd())
                        zipf.write(file_path, arc_name)
        for f in files_to_zip:
            if os.path.exists(f):
                zipf.write(f, f)
    print(f"Created {ZIP_NAME}")

    print("Creating fix zip (styled-jsx)...")
    with zipfile.ZipFile(FIX_ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        path = "node_modules/styled-jsx"
        if os.path.exists(path):
            for root, _, files in os.walk(path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, os.getcwd())
                    zipf.write(file_path, arc_name)
    print(f"Created {FIX_ZIP_NAME}")

def upload_and_deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {SSH_HOST}...")
        client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS)
        print("Connected.")

        sftp = client.open_sftp()
        
        # Upload main zip
        remote_zip = f"{REMOTE_APP_DIR}/{ZIP_NAME}"
        print(f"Uploading {ZIP_NAME} to {remote_zip}...")
        sftp.put(ZIP_NAME, remote_zip)
        
        # Upload fix zip
        remote_fix_zip = f"{REMOTE_APP_DIR}/{FIX_ZIP_NAME}"
        print(f"Uploading {FIX_ZIP_NAME} to {remote_fix_zip}...")
        sftp.put(FIX_ZIP_NAME, remote_fix_zip)
        
        sftp.close()

        # Extract
        print("Extracting files...")
        cmds = [
            f"cd {REMOTE_APP_DIR} && unzip -o {ZIP_NAME}",
            f"cd {REMOTE_APP_DIR} && unzip -o {FIX_ZIP_NAME}", # This might unzip into app_new/node_modules which is a symlink
            f"cd {REMOTE_APP_DIR} && touch tmp/restart.txt",
            f"cd {REMOTE_APP_DIR} && rm {ZIP_NAME} {FIX_ZIP_NAME}"
        ]
        
        for cmd in cmds:
            print(f"Running: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode()
            err = stderr.read().decode()
            if out: print("OUT:", out)
            if err: print("ERR:", err)

        print("Deployment finished successfully!")
        client.close()
    except Exception as e:
        print(f"Error during deployment: {e}")

if __name__ == "__main__":
    create_zips()
    upload_and_deploy()
