import ftplib

def list_deep():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        path = "domains/morsall.com/nodejs"
        try:
            ftp.cwd(path)
            print(f"Files in {path}:", ftp.nlst())
        except:
            print(f"Could not cwd to {path}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

list_deep()
