import ftplib
def empty_htaccess():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open('.htaccess_empty', 'w') as f:
            f.write("# Empty htaccess for testing\n")
        with open('.htaccess_empty', 'rb') as f:
            ftp.storbinary('STOR .htaccess', f)
        ftp.quit()
        print("HTACCESS emptied.")
    except Exception as e:
        print(f"Error: {e}")
empty_htaccess()
