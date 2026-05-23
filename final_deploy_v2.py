import os
import zipfile
import ftplib
import urllib3

urllib3.disable_warnings()

# --- Configuration ---
FTP_HOST = '82.198.228.182'
FTP_USER = 'u754458241.morsall.com'
FTP_PASS = 'l$9Qs3i]g0y]/V~k'

ZIP_NAME = "comprehensive_deploy.zip"

def create_zip():
    print("Creating zip...")
    dirs_to_zip = ['.next', '_next', 'public', 'src', 'prisma', 'node_modules/styled-jsx', 'node_modules/.prisma', 'node_modules/@prisma']
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
    print(f"Created {ZIP_NAME}")

def deploy():
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("FTP Logged in.")
        
        # Upload zip and scripts
        for f in [ZIP_NAME, "force_unzip.php", "sync_to_nodejs.php"]:
            print(f"Uploading {f}...")
            with open(f, "rb") as fh:
                ftp.storbinary(f"STOR {f}", fh)
        
        ftp.quit()
        print("Upload complete!")

        # Trigger extraction and sync via SSH
        import paramiko
        ssh_host = '82.198.228.182'
        ssh_port = 65002
        ssh_user = 'u754458241'
        ssh_pass = '@n9qe3KgL'

        print(f"Connecting to SSH at {ssh_host}:{ssh_port}...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_pass, 
                       look_for_keys=False, allow_agent=False, timeout=20)
        print("Connected via SSH!")

        cmd = (
            "cd /home/u754458241/domains/morsall.com/public_html && "
            "unzip -o comprehensive_deploy.zip ; "
            "php sync_to_nodejs.php"
        )
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        print("\n--- STDOUT ---")
        print(output)
        
        print("\n--- STDERR ---")
        print(error)
        
        # Cleanup zip file
        client.exec_command("rm -f /home/u754458241/domains/morsall.com/public_html/comprehensive_deploy.zip")
        print("Cleaned up remote comprehensive_deploy.zip")
        
        client.close()
        print("SSH session closed. Deployment completed successfully!")

    except Exception as e:
        print(f"Deployment failed: {e}")

if __name__ == "__main__":
    create_zip()
    deploy()
