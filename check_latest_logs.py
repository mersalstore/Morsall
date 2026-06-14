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
        
        ftp.cwd("/nodejs")
        
        # Download server.log tail
        with open("new_server_log.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        
        with open("new_server_log.txt", "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            print(f"Total server.log lines: {len(lines)}")
            print(f"\n== Last 40 lines of server.log ==")
            for line in lines[-40:]:
                print(line.strip())
        
        # Check stderr.log tail
        with open("new_stderr.txt", "wb") as f:
            ftp.retrbinary("RETR stderr.log", f.write)
        
        with open("new_stderr.txt", "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            print(f"\nTotal stderr.log lines: {len(lines)}")
            print(f"\n== Last 40 lines of stderr.log ==")
            for line in lines[-40:]:
                print(line.strip())
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
