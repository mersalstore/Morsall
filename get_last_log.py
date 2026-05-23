import ftplib
import io

def get_last_log():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.voidcmd('TYPE I') # Set binary mode
        ftp.cwd(".") # Root directory
        ftp.sendcmd('TYPE I')
        
        target_log = "stderr.log"
        
        # Get size
        size = ftp.size(target_log)
        print(f"Log size of {target_log}: {size} bytes")
        
        # Read last 20KB
        offset = max(0, size - 20000)
        bio = io.BytesIO()
        ftp.retrbinary(f"RETR {target_log}", bio.write, rest=offset)
        
        print(f"=== SAVING {target_log} CONTENT TO log_output.txt ===")
        with open("log_output.txt", "w", encoding="utf-8") as f:
            f.write(bio.getvalue().decode('utf-8', errors='ignore'))
        print("Done.")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_last_log()
