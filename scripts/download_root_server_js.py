import ftplib

def download_root_server_js():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("root_server_js.txt", "wb") as f:
            ftp.retrbinary("RETR server.js", f.write)
        ftp.quit()
        print("Downloaded server.js from public_html root")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_root_server_js()
