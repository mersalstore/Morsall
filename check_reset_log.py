import ftplib

def check_reset_log():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("reset_log.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

check_reset_log()
