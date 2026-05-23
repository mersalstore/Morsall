import ftplib

def upload_test_ports():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("scripts/test_3001_3002.php", "rb") as f:
            ftp.storbinary("STOR test_ports.php", f)
        ftp.quit()
        print("Uploaded test_ports.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_test_ports()
