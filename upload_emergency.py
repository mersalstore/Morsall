"""Upload only the (edited) emergency_deploy.php to the server. No credential reading."""
import ftplib

ftp = ftplib.FTP('82.198.228.182')
ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
ftp.cwd('/public_html')
with open('emergency_deploy.php', 'rb') as f:
    ftp.storbinary('STOR emergency_deploy.php', f)
print('Uploaded emergency_deploy.php')
ftp.quit()
