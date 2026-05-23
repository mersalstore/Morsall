import ftplib
import sys

def download_file(remote, local):
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open(local, "wb") as f:
            ftp.retrbinary(f"RETR {remote}", f.write)
        print(f"Downloaded {remote}")
        ftp.quit()
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    download_file(sys.argv[1], sys.argv[2])
