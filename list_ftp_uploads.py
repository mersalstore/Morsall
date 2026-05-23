import ftplib

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    try:
        ftp.cwd('uploads')
        print(ftp.nlst())
    except Exception as e:
        print("Could not cwd to uploads:", e)
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
