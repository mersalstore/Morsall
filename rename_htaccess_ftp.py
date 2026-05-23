import ftplib

def rename_htaccess_ftp():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in.")
        try:
            ftp.rename(".htaccess", ".htaccess_bak")
            print("Renamed .htaccess to .htaccess_bak")
        except Exception as e:
            print(f"Failed to rename: {e}")
        ftp.quit()
    except Exception as e:
        print(f"FTP Failed: {e}")

rename_htaccess_ftp()
