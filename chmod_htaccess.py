import ftplib

def chmod_htaccess():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        
        try:
            ftp.voidcmd("SITE CHMOD 644 .htaccess")
            print("Changed .htaccess permissions to 644.")
        except Exception as e:
            print(f"Error chmodding .htaccess: {e}")
            
        ftp.quit()
    except Exception as e:
        print(f"FTP error: {e}")

chmod_htaccess()
