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
        
        # Read restart_server.php to understand how it works
        ftp.cwd("/public_html")
        print("\n== restart_server.php content ==")
        lines = []
        ftp.retrlines("RETR restart_server.php", lambda l: lines.append(l))
        for line in lines:
            print(line)
        
        print("\n== restart_app.php content ==")
        lines2 = []
        ftp.retrlines("RETR restart_app.php", lambda l: lines2.append(l))
        for line in lines2:
            print(line)
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
