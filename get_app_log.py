import ftplib

def get_log():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('app_new')
        with open('app_new_log.txt', 'wb') as f:
            ftp.retrbinary('RETR server.log', f.write)
        ftp.quit()
        print("Log downloaded")
    except Exception as e:
        print(f"Error: {e}")

get_log()
