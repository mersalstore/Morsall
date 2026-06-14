import ftplib
import io

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")
        
        # Download the last 100 lines of stderr.log to see startup errors
        ftp.cwd("/nodejs")
        with open("recent_stderr.txt", "wb") as f:
            ftp.retrbinary("RETR stderr.log", f.write)
        print("Downloaded stderr.log")
        ftp.quit()
        
        # Print last 80 lines
        with open("recent_stderr.txt", "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            print(f"\n=== Last 80 lines of stderr.log (total {len(lines)} lines) ===")
            for line in lines[-80:]:
                print(line.strip())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
