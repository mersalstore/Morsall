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
        
        # Check if the latest server log shows any more startup events after htaccess fix
        ftp.cwd("/nodejs")
        with open("last_server_log.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        
        with open("last_server_log.txt", "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            # Find last 30 lines, but specifically after 12:35 (when we made our fix)
            print(f"Total lines: {len(lines)}")
            print(f"\n== Lines after 12:35 (our fix time) ==")
            for line in lines:
                if "12:35" in line or "12:36" in line or "12:37" in line or "12:38" in line or "12:39" in line or "12:40" in line or "12:41" in line:
                    print(line.strip())
        
        # Also check stderr.log tail
        with open("recent_stderr.txt", "wb") as f:
            ftp.retrbinary("RETR stderr.log", f.write)
        
        with open("recent_stderr.txt", "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            print(f"\n== stderr.log last 40 lines ==")
            for line in lines[-40:]:
                print(line.strip())
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
