import ftplib

def download_diag():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        
        with open("diag_output.txt", "w", encoding="utf-8") as f:
            ftp.retrlines("RETR diag_output.txt", lambda line: f.write(line + "\n"))
        print("Downloaded diag_output.txt successfully.")
        ftp.quit()
    except Exception as e:
        print(f"FTP error: {e}")

download_diag()
