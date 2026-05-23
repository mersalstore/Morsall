import ftplib

ftp = ftplib.FTP('82.198.228.182')
ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')

print("Uploading set_admin_pass.php...")
with open('set_admin_pass.php', 'rb') as f:
    ftp.storbinary('STOR set_admin_pass.php', f)
    print("Uploaded!")

ftp.quit()
