import ftplib

def get_root_log():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # We are in /public_html by default
        with open("public_html_server_log.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        ftp.quit()
        print("Downloaded server.log from public_html")
    except Exception as e:
        print(f"Error: {e}")

get_root_log()
