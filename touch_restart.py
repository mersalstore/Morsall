import ftplib
import io

ftp = ftplib.FTP('82.198.228.182')
ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
try:
    ftp.cwd('../nodejs/tmp')
    ftp.storbinary('STOR restart.txt', io.BytesIO(b'restart'))
    print('Restarted Node App')
except Exception as e:
    print('Error:', e)
ftp.quit()
