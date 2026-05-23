import ftplib

def download_log():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("stderr_latest.txt", "wb") as f:
            ftp.retrbinary("RETR stderr.log", f.write)
        ftp.quit()
        print("Log downloaded")
    except Exception as e:
        print(f"Error: {e}")

download_log()
