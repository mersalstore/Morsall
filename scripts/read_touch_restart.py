import ftplib

def read_touch_restart():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("remote_touch_restart.txt", "wb") as f:
            ftp.retrbinary("RETR touch_restart.php", f.write)
        ftp.quit()
        print("Downloaded touch_restart.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_touch_restart()
