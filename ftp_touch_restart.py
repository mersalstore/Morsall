import ftplib
import io
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)

# Navigate to /nodejs/tmp
try:
    ftp.cwd("/nodejs")
    print("Got into /nodejs")
    # ensure tmp dir
    try:
        ftp.cwd("tmp")
        print("Already in tmp")
    except:
        ftp.mkd("tmp")
        ftp.cwd("tmp")
        print("Created tmp")
    # Write empty restart.txt
    buf = io.BytesIO(b"")
    ftp.storbinary("STOR restart.txt", buf)
    print("OK: Touched /nodejs/tmp/restart.txt")
except Exception as e:
    print(f"Error: {e}")

# Check server.log size
try:
    ftp.cwd("/nodejs")
    items = []
    ftp.retrlines("LIST server.log passenger.log app_log.txt stderr.log my_app_log.txt", items.append)
    print("\n--- log files ---")
    for i in items: print(f"  {i}")
except Exception as e:
    print(f"List error: {e}")

ftp.quit()
print("DONE")
