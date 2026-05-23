import ftplib
def upload_hello():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open('hello.php', 'w') as f:
            f.write("<?php echo 'HELLO'; ?>")
        with open('hello.php', 'rb') as f:
            ftp.storbinary('STOR hello.php', f)
        ftp.quit()
        print("hello.php uploaded.")
    except Exception as e:
        print(f"Error: {e}")
upload_hello()
