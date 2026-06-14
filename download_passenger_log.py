import ftplib

def download_passenger_log():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        
        with open("passenger.log", "wb") as f:
            ftp.retrbinary("RETR passenger.log", f.write)
        print("Downloaded passenger.log successfully.")
        ftp.quit()
    except Exception as e:
        print(f"FTP error: {e}")

download_passenger_log()
