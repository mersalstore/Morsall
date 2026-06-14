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
        
        # Read current server.js
        ftp.cwd("/nodejs")
        
        print("\n== Current server.js ==")
        lines = []
        ftp.retrlines("RETR server.js", lambda l: lines.append(l))
        for line in lines:
            print(line)
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
