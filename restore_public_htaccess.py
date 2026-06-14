import ftplib

def restore_htaccess():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        
        with open("public_htaccess.txt", "rb") as f:
            ftp.storbinary("STOR .htaccess", f)
            
        print("Successfully restored original .htaccess.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

restore_htaccess()
