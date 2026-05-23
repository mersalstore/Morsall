import ftplib

def upload_touch_all():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("scripts/touch_all_dirs.php", "rb") as f:
            ftp.storbinary("STOR touch_all.php", f)
        ftp.quit()
        print("Uploaded touch_all.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_touch_all()
