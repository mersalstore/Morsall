import ftplib

def check_start_morsall():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        with open("remote_start_morsall.txt", "wb") as f:
            ftp.retrbinary("RETR start_morsall.js", f.write)
        ftp.quit()
        print("Downloaded start_morsall.js from app_new")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_start_morsall()
