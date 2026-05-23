import ftplib

def upload_v4():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        with open("scripts/real_server_v4.txt", "rb") as f:
            ftp.storbinary("STOR start_morsall.js", f)
        ftp.quit()
        print("Uploaded V4 to app_new/start_morsall.js")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_v4()
