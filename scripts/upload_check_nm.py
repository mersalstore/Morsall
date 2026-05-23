import ftplib

def upload_check_nm():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("scripts/check_app_new_node_modules.php", "rb") as f:
            ftp.storbinary("STOR check_nm.php", f)
        ftp.quit()
        print("Uploaded check_nm.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_check_nm()
