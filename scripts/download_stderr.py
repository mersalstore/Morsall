import ftplib

def download_stderr():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        with open("app_new_stderr.log", "wb") as f:
            ftp.retrbinary("RETR stderr.log", f.write)
        ftp.quit()
        print("Downloaded app_new/stderr.log")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_stderr()
