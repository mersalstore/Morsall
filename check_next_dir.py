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
        
        # Check what's in /nodejs/.next
        ftp.cwd("/nodejs")
        print("\n== /nodejs top-level directories ==")
        files = []
        ftp.dir(files.append)
        for f in files:
            print(f)
            
        print("\n== /nodejs/.next (if exists) ==")
        try:
            ftp.cwd("/nodejs/.next")
            nextfiles = []
            ftp.dir(nextfiles.append)
            for f in nextfiles[:20]:
                print(f)
        except Exception as e:
            print(f"No .next: {e}")
        
        # Check last 30 lines of server.log for new starts
        ftp.cwd("/nodejs")
        with open("last_server_log.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        
        with open("last_server_log.txt", "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            print(f"\n== Last 30 lines of server.log (total {len(lines)} lines) ==")
            for line in lines[-30:]:
                print(line.strip())
                
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
