import ftplib

def read_env():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        with open("remote_env.txt", "wb") as f:
            ftp.retrbinary("RETR .env", f.write)
        ftp.quit()
        print("Downloaded .env from app_new")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_env()
