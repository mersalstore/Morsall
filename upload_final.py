import ftplib
import os
def upload_final():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    filename = "site_rebuild_final.zip"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        with open(filename, "rb") as file:
            ftp.storbinary(f"STOR {filename}", file)
        ftp.quit()
        print("Uploaded site_rebuild_final.zip")
    except Exception as e:
        print(f"Error: {e}")
upload_final()
