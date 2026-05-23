import ftplib
import time

def touch_restart_ftp():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in.")
        try: ftp.mkd("tmp")
        except: pass
        
        with open("package.json", "rb") as f:
            ftp.storbinary("STOR tmp/restart.txt", f)
        print("Restarted.")
        ftp.quit()
    except Exception as e:
        print(f"Failed: {e}")

touch_restart_ftp()
