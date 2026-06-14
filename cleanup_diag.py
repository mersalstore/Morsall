import ftplib

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
try:
    ftp.delete("diag_db.php")
    print("Deleted diag_db.php from server")
except Exception as e:
    print(f"Delete error: {e}")
ftp.quit()
