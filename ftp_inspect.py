import ftplib
import io

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
print(f"PWD: {ftp.pwd()}")

# Try to download current .htaccess
print("\n=== Downloading .htaccess ===")
buf = io.BytesIO()
try:
    ftp.retrbinary("RETR .htaccess", buf.write)
    content = buf.getvalue().decode("utf-8", errors="ignore")
    print(content)
except Exception as e:
    print(f"Error: {e}")

# Restart by touching restart.txt — try multiple locations via FTP
print("\n=== Listing tmp dir if exists ===")
try:
    files = []
    ftp.cwd("/")
    ftp.retrlines("LIST tmp 2>&1", files.append)
    for f in files[:10]: print(f)
except Exception as e:
    print(f"Tmp list error: {e}")

ftp.quit()
print("DONE")
