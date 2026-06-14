import ftplib
ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")
with open("count_records.php", "rb") as f:
    ftp.storbinary("STOR count_records.php", f)
print("Uploaded count_records.php")
ftp.quit()
