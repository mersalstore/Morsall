import ftplib

def download_server_js():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("server_js_check.txt", "wb") as f:
            ftp.retrbinary("RETR server.js", f.write)
        ftp.quit()
        print("Downloaded server.js from public_html")
    except Exception as e:
        print(f"Error: {e}")

download_server_js()
