import ftplib
ftp = ftplib.FTP('82.198.228.182')
ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
try: 
    ftp.rename('.htaccess', '.htaccess_disabled')
    print('Disabled .htaccess')
except Exception as e: 
    print('Error renaming:', e)
ftp.quit()
