import ftplib

def list_nodejs_ftp():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in.")
        try:
            ftp.cwd("nodejs")
            print("In nodejs dir:", ftp.nlst())
        except Exception as e:
            print(f"Could not enter nodejs: {e}")
        ftp.quit()
    except Exception as e:
        print(f"FTP Failed: {e}")

list_nodejs_ftp()
