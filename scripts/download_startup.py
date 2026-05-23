import ftplib

def download_startup():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("root_startup.txt", "wb") as f:
            ftp.retrbinary("RETR startup.js", f.write)
        ftp.quit()
        print("Downloaded startup.js from public_html root")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_startup()
