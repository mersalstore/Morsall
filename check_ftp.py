import ftplib
HOST = "82.198.228.182"
USER = "u754458241.morsall.com"
PASW = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(HOST)
ftp.login(USER, PASW)
print("Current directory:", ftp.pwd())
print("Files in current directory:")
ftp.retrlines('LIST')
ftp.quit()
