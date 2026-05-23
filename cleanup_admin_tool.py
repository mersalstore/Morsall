import ftplib

ftp = ftplib.FTP('82.198.228.182')
ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')

try:
    ftp.delete('set_admin_pass.php')
    print("Deleted set_admin_pass.php")
except Exception as e:
    print("Error deleting:", e)

ftp.quit()
