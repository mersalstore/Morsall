import ftplib

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    ftp.cwd('..')
    ftp.cwd('nodejs/tmp')
    
    with open('restart.txt', 'w') as f:
        f.write('RESTARTED\n')
        
    with open('restart.txt', 'rb') as f:
        ftp.storbinary('STOR restart.txt', f)
        
    ftp.quit()
    print("Restarted Passenger!")
except Exception as e:
    print(f"Error: {e}")
