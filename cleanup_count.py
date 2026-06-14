import ftplib
ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")
for f in ["count_records.php"]:
    try:
        ftp.delete(f)
        print(f"Deleted: {f}")
    except Exception as e:
        print(f"Skip {f}: {e}")
ftp.quit()
