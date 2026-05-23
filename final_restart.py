import ftplib
import io

def final_restart():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('app_new')
        try:
            ftp.mkd('tmp')
        except:
            pass
        ftp.cwd('tmp')
        ftp.storbinary('STOR restart.txt', io.BytesIO(b'restart'))
        ftp.quit()
        print("Final restart triggered in app_new")
    except Exception as e:
        print(f"Error: {e}")

final_restart()
