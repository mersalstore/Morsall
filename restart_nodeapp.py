import ftplib
import io

def trigger_nodeapp_restart():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('/') # Home
        try:
            ftp.cwd('nodeapp')
        except:
            ftp.cwd('app') # Fallback
            
        try:
            ftp.mkd('tmp')
        except:
            pass
        ftp.cwd('tmp')
        ftp.storbinary('STOR restart.txt', io.BytesIO(b'restart'))
        ftp.quit()
        print("Nodeapp restart triggered")
    except Exception as e:
        print(f"Error: {e}")

trigger_nodeapp_restart()
