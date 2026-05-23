import ftplib
def kill_node():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        ftp.rename("server-hostinger.js", "server-hostinger.js.bak")
        ftp.quit()
        print("Node.js entry point renamed (Stopped).")
    except Exception as e:
        print(f"Error: {e}")
kill_node()
