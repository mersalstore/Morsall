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
        
        # Check .next/BUILD_ID in both public_html and nodejs
        print("\n== /nodejs/.next/BUILD_ID ==")
        try:
            ftp.cwd("/nodejs/.next")
            lines = []
            ftp.retrlines("RETR BUILD_ID", lambda l: lines.append(l))
            print("\n".join(lines))
        except Exception as e:
            print(f"Error: {e}")
        
        print("\n== /public_html/.next/BUILD_ID ==")
        try:
            ftp.cwd("/public_html/.next")
            lines = []
            ftp.retrlines("RETR BUILD_ID", lambda l: lines.append(l))
            print("\n".join(lines))
        except Exception as e:
            print(f"Error: {e}")
            
        # Check /nodejs/server.js size to confirm it got updated
        ftp.cwd("/nodejs")
        print("\n== /nodejs/server.js info ==")
        files = []
        ftp.dir("server.js", files.append)
        for f in files:
            print(f)
        
        # Check /public_html/.next modification times
        print("\n== /public_html/.next files ==")
        ftp.cwd("/public_html/.next")
        files = []
        ftp.dir(files.append)
        for f in files[:10]:
            print(f)
        
        # Compare /nodejs and /public_html server.log sizes
        print("\n== /nodejs/server.log size ==")
        ftp.cwd("/nodejs")
        size = ftp.size("server.log")
        print(f"server.log: {size} bytes")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
