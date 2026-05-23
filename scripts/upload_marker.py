import ftplib

def upload_marker():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("where_am_i.txt", "rb") as f:
            ftp.storbinary("STOR where_am_i.txt", f)
        ftp.quit()
        print("Uploaded marker to /public_html/where_am_i.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_marker()
