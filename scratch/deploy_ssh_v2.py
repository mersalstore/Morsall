import paramiko
import os
import zipfile

# --- Configuration ---
SSH_HOST = "82.198.228.182"
SSH_PORT = 65002
SSH_USER = "u754458241"
SSH_PASS = "@n9qe3KgL"
ZIP_NAME = "morsall_production_update.zip"
REMOTE_PATH = "/home/u754458241/domains/morsall.com/nodejs"

def create_zip():
    print("Creating deployment zip...")
    dirs_to_zip = ['.next', '_next', 'public', 'prisma']
    files_to_zip = [
        'server-hostinger.js', 
        '.env.production', 
        'package.json', 
        'next.config.js', 
        '.htaccess',
        'app.js'
    ]
    
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
    
    print(f"Created {ZIP_NAME} ({os.path.getsize(ZIP_NAME) // (1024*1024)} MB)")

def deploy_via_ssh():
    try:
        print("Connecting to SSH...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS)
        
        sftp = client.open_sftp()
        print(f"Uploading {ZIP_NAME} to {REMOTE_PATH}...")
        sftp.put(ZIP_NAME, f"{REMOTE_PATH}/{ZIP_NAME}")
        sftp.close()
        print("Upload complete!")
        
        print("Extracting zip and restarting app...")
        commands = [
            f"cd {REMOTE_PATH} && unzip -o {ZIP_NAME}",
            f"cd {REMOTE_PATH} && rm {ZIP_NAME}",
            f"cd {REMOTE_PATH} && mkdir -p tmp && touch tmp/restart.txt"
        ]
        
        for cmd in commands:
            print(f"Executing: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode()
            err = stderr.read().decode()
            if out: print(f"Output: {out}")
            if err: print(f"Error: {err}")
            
        client.close()
        print("Deployment successful!")

    except Exception as e:
        print(f"Error during deployment: {e}")

if __name__ == "__main__":
    create_zip()
    deploy_via_ssh()
