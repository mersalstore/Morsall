import ftplib

def check_app_size():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("/app")
        ftp.voidcmd('TYPE I')
        print("Log Size in /app:", ftp.size("server.log"))
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_app_size()
