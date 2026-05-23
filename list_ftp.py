import ftplib

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    ftp.cwd('public_html')
    print("FTP Current Dir:", ftp.pwd())
    print("Files in public_html:")
    ftp.retrlines('LIST')
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
