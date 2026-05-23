import ftplib

def upload_find_script():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("scripts/find_script_content.php", "rb") as f:
            ftp.storbinary("STOR find_script.php", f)
        ftp.quit()
        print("Uploaded find_script.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_find_script()
