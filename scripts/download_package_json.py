import ftplib

def read_package_json():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        with open("remote_package_json.txt", "wb") as f:
            ftp.retrbinary("RETR package.json", f.write)
        ftp.quit()
        print("Downloaded package.json from app_new")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_package_json()
