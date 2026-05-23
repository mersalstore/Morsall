import ftplib

def download_server_log():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Check in /app (where I saw a server.log earlier)
        ftp.cwd("/app")
        with open("server_log_check.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        ftp.quit()
        print("Downloaded server.log from /app")
    except Exception as e:
        print(f"Error: {e}")

download_server_log()
