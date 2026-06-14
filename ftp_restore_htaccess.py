import ftplib
import io
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")

# Restore original .htaccess from backup
ORIG = open("public_htaccess.txt", "r", encoding="utf-8").read()
ftp.cwd("/public_html")
ftp.storbinary("STOR .htaccess", io.BytesIO(ORIG.encode("utf-8")))
print("Restored original .htaccess")
print("--- Content ---")
print(ORIG)

# Touch restart
ftp.cwd("/nodejs/tmp")
ftp.storbinary("STOR restart.txt", io.BytesIO(b""))
print("Touched restart.txt")

ftp.quit()
print("DONE")
