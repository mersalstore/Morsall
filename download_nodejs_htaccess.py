import ftplib

def download_nodejs_htaccess():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        
        with open("nodejs_htaccess.txt", "w", encoding="utf-8") as f:
            ftp.retrlines("RETR .htaccess", lambda line: f.write(line + "\n"))
        print("Downloaded nodejs/.htaccess successfully.")
        ftp.quit()
    except Exception as e:
        print(f"FTP error: {e}")

download_nodejs_htaccess()
