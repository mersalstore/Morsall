import ftplib

def download_app_js():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("/app")
        with open("remote_app_js.txt", "wb") as f:
            ftp.retrbinary("RETR app.js", f.write)
        ftp.quit()
        print("Downloaded app.js from /app")
    except Exception as e:
        print(f"Error: {e}")

download_app_js()
