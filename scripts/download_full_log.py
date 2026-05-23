import ftplib

def download_full_log():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        with open("full_server_log.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        ftp.quit()
        print("Downloaded full server.log")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_full_log()
