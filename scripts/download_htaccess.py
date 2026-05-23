import ftplib

def download_htaccess():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        with open("remote_htaccess.txt", "wb") as f:
            ftp.retrbinary("RETR .htaccess", f.write)
        ftp.quit()
        print("Downloaded .htaccess from app_new")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_htaccess()
