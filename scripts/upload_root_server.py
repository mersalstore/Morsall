import ftplib

def upload_root_server():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        with open("root_server_improved.js", "rb") as f:
            ftp.storbinary("STOR server.js", f)
        ftp.quit()
        print("Uploaded root_server_improved.js to public_html/server.js")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_root_server()
