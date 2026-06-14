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
        
        # List /nodeapp to understand its structure
        print("\n== /nodeapp contents ==")
        try:
            ftp.cwd("/nodeapp")
            files = []
            ftp.dir(files.append)
            for f in files:
                print(f)
        except Exception as e:
            print(f"Error accessing /nodeapp: {e}")
        
        # Check /nodeapp/server.js
        print("\n== /nodeapp/server.js (first 10 lines) ==")
        try:
            lines = []
            ftp.retrlines("RETR server.js", lambda l: lines.append(l))
            for line in lines[:15]:
                print(line)
        except Exception as e:
            print(f"Error: {e}")
        
        # Check /nodeapp/.htaccess
        print("\n== /nodeapp/.htaccess ==")
        try:
            lines = []
            ftp.retrlines("RETR .htaccess", lambda l: lines.append(l))
            for line in lines:
                print(line)
        except Exception as e:
            print(f"Error: {e}")
        
        # Check /nodeapp/tmp 
        print("\n== /nodeapp/tmp ==")
        try:
            ftp.cwd("/nodeapp/tmp")
            files = []
            ftp.dir(files.append)
            for f in files:
                print(f)
        except Exception as e:
            print(f"No /nodeapp/tmp: {e}")
        
        # Check /nodeapp/server.log (last entries)
        print("\n== /nodeapp/server.log (last 20 lines) ==")
        try:
            ftp.cwd("/nodeapp")
            with open("nodeapp_server_log.txt", "wb") as f:
                ftp.retrbinary("RETR server.log", f.write)
            with open("nodeapp_server_log.txt", "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
            print(f"Total lines: {len(lines)}")
            for line in lines[-20:]:
                print(line.strip())
        except Exception as e:
            print(f"Error: {e}")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
