import ftplib
def upload_unzip():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        with open("unzip.php", "rb") as file:
            ftp.storbinary("STOR unzip.php", file)
        ftp.quit()
        print("Uploaded unzip.php")
    except Exception as e:
        print(f"Error: {e}")
upload_unzip()
