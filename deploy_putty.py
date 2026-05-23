import os
import subprocess
import time

# --- Configuration ---
SSH_HOST = '82.198.228.182'
SSH_PORT = '65002'
SSH_USER = 'u754458241'
SSH_PASS = '@n9qe3KgL'

TARGET_DIRS = [
    '/home/u754458241/domains/morsall.com/public_html/app_new',
    '/home/u754458241/domains/morsall.com/nodejs'
]

ZIP_NAME = "comprehensive_deploy.zip"

def run_cmd(cmd):
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    return result.stdout

def deploy():
    # 1. Create zip
    import zipfile
    print("Creating zip...")
    dirs_to_zip = ['.next', '_next', 'public', 'src', 'prisma']
    files_to_zip = ['server-hostinger.js', '.env.production', 'package.json', 'next.config.js', 'server.js', '.htaccess', 'start_morsall.js']
    
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for d in dirs_to_zip:
            if os.path.exists(d):
                for root, _, files in os.walk(d):
                    if 'cache' in root and '.next' in root: continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path, os.path.relpath(file_path, os.getcwd()))
        for f in files_to_zip:
            if os.path.exists(f): zipf.write(f, f)
    
    # 2. Deploy to each target
    for target in TARGET_DIRS:
        print(f"\n--- Deploying to {target} ---")
        
        # Upload via pscp
        upload_cmd = f'pscp.exe -P {SSH_PORT} -pw "{SSH_PASS}" {ZIP_NAME} {SSH_USER}@{SSH_HOST}:{target}/{ZIP_NAME}'
        run_cmd(upload_cmd)
        
        # Unzip via plink
        unzip_cmd = f'echo y | plink.exe -P {SSH_PORT} -pw "{SSH_PASS}" {SSH_USER}@{SSH_HOST} "cd {target} && unzip -o {ZIP_NAME} && mkdir -p tmp && touch tmp/restart.txt && rm {ZIP_NAME}"'
        run_cmd(unzip_cmd)
        
    print("\nDone!")

if __name__ == "__main__":
    deploy()
