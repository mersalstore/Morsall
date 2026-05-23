import ftplib
def rename_php():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.rename("unzip.php", "fix.php")
        ftp.quit()
        print("unzip.php renamed to fix.php")
    except Exception as e:
        print(f"Error: {e}")
rename_php()
