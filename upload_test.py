import ftplib
def upload_test():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open('test.html', 'w') as f:
            f.write("<h1>TEST OK</h1>")
        with open('test.html', 'rb') as f:
            ftp.storbinary('STOR test.html', f)
        ftp.quit()
        print("Test file uploaded.")
    except Exception as e:
        print(f"Error: {e}")
upload_test()
