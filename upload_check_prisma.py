import ftplib
ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")
with open("check_prisma_state.php", "rb") as f:
    ftp.storbinary("STOR check_prisma_state.php", f)
print("Uploaded check_prisma_state.php")
ftp.quit()
