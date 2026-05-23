import ftplib
import os

def upload_full():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    filename = "full_deploy.zip"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        with open(filename, "rb") as file:
            ftp.storbinary(f"STOR {filename}", file)
        ftp.quit()
        print(f"Uploaded {filename}")
    except Exception as e:
        print(f"Error: {e}")

upload_full()
