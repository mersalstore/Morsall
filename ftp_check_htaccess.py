import ftplib
import io
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")
ftp.cwd("/public_html")

# Read current .htaccess
buf = io.BytesIO()
try:
    ftp.retrbinary("RETR .htaccess", buf.write)
    content = buf.getvalue().decode("utf-8", errors="ignore")
    print("=== Current .htaccess ===")
    print(content)
except Exception as e:
    print(f".htaccess error: {e}")

ftp.quit()
print("DONE")
