import ftplib

def upload_ps():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("scripts/ps.php", "rb") as f:
            ftp.storbinary("STOR ps.php", f)
        ftp.quit()
        print("Uploaded ps.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_ps()
