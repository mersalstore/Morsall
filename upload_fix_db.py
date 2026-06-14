import ftplib

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
with open("fix_db_schema.php", "rb") as f:
    ftp.storbinary("STOR fix_db_schema.php", f)
print("Uploaded fix_db_schema.php")
ftp.quit()
