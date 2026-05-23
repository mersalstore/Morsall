import ftplib

def check_file_exists():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in.")
        try:
            ftp.cwd("src/lib")
            print("Files in src/lib:", ftp.nlst())
        except Exception as e:
            print(f"Could not enter src/lib: {e}")
        ftp.quit()
    except Exception as e:
        print(f"FTP Failed: {e}")

check_file_exists()
