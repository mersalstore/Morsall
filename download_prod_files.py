import ftplib

def download_files():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        
        # Download .env.production
        try:
            ftp.cwd("/nodejs")
            with open("remote_env_production.txt", "w", encoding="utf-8") as f:
                ftp.retrlines("RETR .env.production", lambda line: f.write(line + "\n"))
            print("Downloaded .env.production successfully.")
        except Exception as e:
            print(f"Error downloading .env.production: {e}")
            
        # Download stderr.log (last 1000 lines or so to avoid huge download, or just download the whole file since it's 2.4MB)
        try:
            ftp.cwd("/nodejs")
            with open("remote_stderr.log", "wb") as f:
                ftp.retrbinary("RETR stderr.log", f.write)
            print("Downloaded stderr.log successfully.")
        except Exception as e:
            print(f"Error downloading stderr.log: {e}")
            
        ftp.quit()
    except Exception as e:
        print(f"FTP error: {e}")

download_files()
