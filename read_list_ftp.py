import ftplib

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    
    with open('nodeapp_list_final.txt', 'wb') as f:
        ftp.retrbinary('RETR nodeapp_listing.txt', f.write)
    
    print(open('nodeapp_list_final.txt').read())
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
