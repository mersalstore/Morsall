import ftplib
def get_htaccess():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open('remote_htaccess.txt', 'wb') as f:
            ftp.retrbinary('RETR .htaccess', f.write)
        ftp.quit()
        print("Downloaded .htaccess")
    except Exception as e:
        print(f"Error: {e}")
get_htaccess()
