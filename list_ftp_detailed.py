import ftplib

def list_root_detailed():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("/")
        print("Detailed listing of FTP Root:")
        ftp.dir()
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

list_root_detailed()
