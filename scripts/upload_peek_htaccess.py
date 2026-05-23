import ftplib

def upload_peek_htaccess():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("scripts/peek_nodeapp_htaccess.php", "rb") as f:
            ftp.storbinary("STOR peek_htaccess.php", f)
        ftp.quit()
        print("Uploaded peek_htaccess.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_peek_htaccess()
