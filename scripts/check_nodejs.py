import ftplib

def check_nodejs():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        try:
            ftp.cwd("nodejs")
            print("Successfully entered nodejs")
            print("Files:", ftp.nlst())
        except Exception as e:
            print(f"Error entering nodejs: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_nodejs()
