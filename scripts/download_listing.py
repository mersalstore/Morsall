import ftplib

def download_listing():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("nodeapp_listing.txt", "wb") as f:
            ftp.retrbinary("RETR nodeapp_listing.txt", f.write)
        ftp.quit()
        print("Downloaded nodeapp_listing.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_listing()
