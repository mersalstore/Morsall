import ftplib

def upload():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    print("Connecting via FTP...")
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    
    ftp.cwd('/public_html')
    print("Uploading public_html_htaccess as .htaccess...")
    with open("public_html_htaccess", "rb") as f:
        ftp.storbinary("STOR .htaccess", f)
        
    print("Upload complete!")
    ftp.quit()

if __name__ == "__main__":
    upload()
