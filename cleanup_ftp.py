import ftplib
import os

def cleanup():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        
        # Upload simplified server-hostinger.js
        with open("server-hostinger.js", "rb") as file:
            ftp.storbinary("STOR server-hostinger.js", file)
            
        # Delete deep_clean.txt if exists
        try:
            ftp.delete("deep_clean.txt")
            print("Deleted deep_clean.txt")
        except:
            pass
            
        # Restart
        ftp.cwd("tmp")
        import io
        ftp.storbinary("STOR restart.txt", io.BytesIO(b"Restarted at " + os.urandom(4).hex().encode()))
        
        ftp.quit()
        print("Cleanup done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    cleanup()
