import ftplib

def download_active_app():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("root_server_js.txt", "wb") as f:
            ftp.retrbinary("RETR server.js", f.write)
        ftp.quit()
        print("Downloaded active app.js")
    except Exception as e:
        print(f"Error: {e}")

download_active_app()
