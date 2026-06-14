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
        
        # Download current .htaccess from public_html
        ftp.cwd("/public_html")
        
        print("\n== Contents of /public_html ==")
        ftp.dir()
        
        print("\n== Current .htaccess ==")
        try:
            lines = []
            ftp.retrlines("RETR .htaccess", lambda l: lines.append(l))
            for line in lines:
                print(line)
        except Exception as e:
            print(f"No .htaccess or error: {e}")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
