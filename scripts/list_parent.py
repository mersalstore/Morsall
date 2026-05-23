import ftplib

def list_parent():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("..")
        print("FTP Current Dir:", ftp.pwd())
        print("Files in parent:", ftp.nlst())
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_parent()
