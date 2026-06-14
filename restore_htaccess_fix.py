import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    ftp.cwd("..")
    ftp.cwd("public_html")
    print("Files in public_html:", ftp.nlst())
    
    if ".htaccess_temp_off" in ftp.nlst():
        ftp.rename(".htaccess_temp_off", ".htaccess")
        print("Restored .htaccess from .htaccess_temp_off")
    elif ".htaccess" not in ftp.nlst():
        print(".htaccess is MISSING! Restoring from nodejs/ or creating a standard one...")
        # Let's see if we have a backup
        ftp.cwd("..")
        ftp.cwd("domains/morsall.com/nodejs") # wait, default login is nodejs, which is /
        # Let's just create a standard .htaccess in public_html
        ftp.cwd("/")
        # Download .htaccess from nodejs (FTP root) and upload to public_html
        with open("temp_htaccess", "wb") as f:
            ftp.retrbinary("RETR .htaccess", f.write)
        ftp.cwd("..")
        ftp.cwd("public_html")
        with open("temp_htaccess", "rb") as f:
            ftp.storbinary("STOR .htaccess", f)
        print("Restored .htaccess from nodejs/.htaccess")
        
    ftp.quit()

if __name__ == "__main__":
    main()
