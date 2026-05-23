import ftplib
import os

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    ftp.cwd('nodeapp')
    
    with open('remote_stderr.log', 'wb') as f:
        ftp.retrbinary('RETR stderr.log', f.write)
    
    with open('remote_stderr.log', 'r') as f:
        content = f.read()
        print("LAST 500 CHARS OF STDERR.LOG:")
        print(content[-500:])
        
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
