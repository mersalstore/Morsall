import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    # Go to /home/u754458241/public_html
    ftp.cwd("..")
    print("PWD:", ftp.pwd())
    ftp.cwd("public_html")
    print("PWD in public_html:", ftp.pwd())
    
    print("\n== .htaccess in public_html ==")
    try:
        lines = []
        ftp.retrlines("RETR .htaccess", lambda l: lines.append(l))
        for l in lines:
            print(l)
    except Exception as e:
        print(f"Error reading .htaccess: {e}")
        
    ftp.quit()

if __name__ == "__main__":
    main()
