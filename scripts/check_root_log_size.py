import ftplib

def check_root_log_size():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        ftp.voidcmd('TYPE I')
        print("Log Size in /public_html:", ftp.size("server.log"))
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_root_log_size()
