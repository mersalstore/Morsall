import ftplib

def upload_jsx():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("scripts/check_styled_jsx.php", "rb") as f:
            ftp.storbinary("STOR check_jsx.php", f)
        ftp.quit()
        print("Uploaded check_jsx.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_jsx()
