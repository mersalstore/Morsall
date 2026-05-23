import ftplib

def list_app_new_ftp():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in.")
        try:
            ftp.cwd("app_new")
            print("In app_new dir:", ftp.nlst())
        except Exception as e:
            print(f"Could not enter app_new: {e}")
        ftp.quit()
    except Exception as e:
        print(f"FTP Failed: {e}")

list_app_new_ftp()
