import ftplib

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
print(f"PWD: {ftp.pwd()}")

with open("diag_db.php", "rb") as f:
    ftp.storbinary("STOR diag_db.php", f)
print("Uploaded diag_db.php")
ftp.quit()
