import ftplib

def upload_find_str_2():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("scripts/find_string_targeted.php", "rb") as f:
            ftp.storbinary("STOR find_str_2.php", f)
        ftp.quit()
        print("Uploaded find_str_2.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_find_str_2()
