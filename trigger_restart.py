import ftplib
import io

def trigger_restart():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        try:
            ftp.mkd('app_new/tmp')
        except:
            pass
        ftp.cwd('app_new/tmp')
        ftp.storbinary('STOR restart.txt', io.BytesIO(b'restart'))
        ftp.quit()
        print("Restart triggered")
    except Exception as e:
        print(f"Error: {e}")

trigger_restart()
