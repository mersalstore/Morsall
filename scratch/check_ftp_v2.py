import ftplib

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)

print("Current directory:", ftp.pwd())
print("Directory listing:")
ftp.retrlines('LIST')

ftp.quit()
