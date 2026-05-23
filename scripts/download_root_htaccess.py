import ftplib

def download_root_htaccess():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("/public_html")
        print("Successfully entered public_html")
        with open("remote_root_htaccess.txt", "wb") as f:
            ftp.retrbinary("RETR .htaccess", f.write)
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_root_htaccess()
