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
        
        # Check nodejs .htaccess
        ftp.cwd("/nodejs")
        print("\n== /nodejs/.htaccess ==")
        try:
            lines = []
            ftp.retrlines("RETR .htaccess", lambda l: lines.append(l))
            for line in lines:
                print(line)
        except Exception as e:
            print(f"No .htaccess in /nodejs: {e}")
        
        # Check public_html .htaccess
        ftp.cwd("/public_html")
        print("\n== /public_html/.htaccess ==")
        try:
            lines = []
            ftp.retrlines("RETR .htaccess", lambda l: lines.append(l))
            for line in lines:
                print(line)
        except Exception as e:
            print(f"No .htaccess in /public_html: {e}")
        
        # Check .env.production in nodejs
        ftp.cwd("/nodejs")
        print("\n== /nodejs/.env.production ==")
        try:
            lines = []
            ftp.retrlines("RETR .env.production", lambda l: lines.append(l))
            for line in lines:
                # Redact sensitive values
                if any(x in line for x in ["PASSWORD", "SECRET", "KEY", "DATABASE_URL"]):
                    k = line.split("=")[0] if "=" in line else line
                    print(f"{k}=***REDACTED***")
                else:
                    print(line)
        except Exception as e:
            print(f"No .env.production in /nodejs: {e}")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
