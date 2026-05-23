import ftplib
import os

def upload_recursive(ftp, local_dir, remote_dir):
    try:
        ftp.mkd(remote_dir)
    except:
        pass
        
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isdir(local_path):
            if item in ["node_modules", ".next", ".git"]: continue
            upload_recursive(ftp, local_path, remote_path)
        else:
            print(f"Uploading {local_path} to {remote_path}...")
            with open(local_path, "rb") as f:
                ftp.storbinary(f"STOR {remote_path}", f)

def start_upload():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in.")
    
    # Upload src
    upload_recursive(ftp, "src", "src")
    
    # Upload other important files
    for f in ["server-hostinger.js", "next.config.js", "package.json", "server.js", "start_morsall.js"]:
        print(f"Uploading {f}...")
        with open(f, "rb") as fh:
            ftp.storbinary(f"STOR {f}", fh)
            
    ftp.quit()
    print("Full upload complete!")

start_upload()
