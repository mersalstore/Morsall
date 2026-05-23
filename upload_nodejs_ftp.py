import ftplib
import os

def upload_nodejs_zip():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    file_path = "deploy_nodejs.zip"
    target_path = "domains/morsall.com/nodejs/deploy_nodejs.zip"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in via FTP")
        
        with open(file_path, "rb") as f:
            ftp.storbinary(f"STOR {target_path}", f)
        
        print(f"Uploaded {file_path} to {target_path}")
        ftp.quit()
    except Exception as e:
        print(f"FTP Upload Failed: {e}")

upload_nodejs_zip()
