import ftplib

def download_public_htaccess():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        
        with open("public_htaccess.txt", "w", encoding="utf-8") as f:
            ftp.retrlines("RETR .htaccess", lambda line: f.write(line + "\n"))
        print("Downloaded public_html/.htaccess successfully.")
        ftp.quit()
    except Exception as e:
        print(f"FTP error: {e}")

download_public_htaccess()
