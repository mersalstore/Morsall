import ftplib
import os
import sys

def upload_prisma():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    filename = "prisma_client.zip"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        filesize = os.path.getsize(filename)
        print(f"Uploading {filename}...")
        with open(filename, "rb") as file:
            ftp.storbinary(f"STOR {filename}", file)
        ftp.quit()
        print("Uploaded prisma_client.zip")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_prisma()
