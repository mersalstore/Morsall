import ftplib

def upload_check_apply():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("scripts/check_apply.php", "rb") as f:
            ftp.storbinary("STOR check_apply.php", f)
        ftp.quit()
        print("Uploaded check_apply.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_check_apply()
