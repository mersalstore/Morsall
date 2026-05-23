import ftplib

def upload_root_root_htaccess():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("/")
        with open("remote_root_htaccess.txt", "rb") as f:
            ftp.storbinary("STOR .htaccess", f)
        ftp.quit()
        print("Uploaded .htaccess to domain root (/)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_root_root_htaccess()
