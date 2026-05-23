import ftplib

def check_pwd():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        print("Current FTP Directory:", ftp.pwd())
        print("Files:", ftp.nlst())
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

check_pwd()
