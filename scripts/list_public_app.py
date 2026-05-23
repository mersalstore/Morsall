import ftplib

def list_public_app():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        try:
            print("Files in public_html/app:", ftp.nlst("app"))
        except Exception as e:
            print(f"Error listing app: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_public_app()
