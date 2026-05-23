import ftplib

def delete_start_morsall():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        try:
            ftp.delete("start_morsall.js")
            print("Deleted start_morsall.js from app_new")
        except Exception as e:
            print(f"Error deleting: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    delete_start_morsall()
