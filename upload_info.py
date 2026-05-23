import ftplib
def upload_info():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open('info.php', 'w') as f:
            f.write("<?php phpinfo(); ?>")
        with open('info.php', 'rb') as f:
            ftp.storbinary('STOR info.php', f)
        ftp.quit()
        print("info.php uploaded.")
    except Exception as e:
        print(f"Error: {e}")
upload_info()
