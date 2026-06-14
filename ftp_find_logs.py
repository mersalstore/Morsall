import ftplib
import io
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
ftp.cwd("/nodejs")

# List all files in /nodejs
print("=== All files in /nodejs ===")
items = []
ftp.retrlines("LIST", items.append)
log_files = []
for i in items:
    if '.log' in i.lower() or '.txt' in i.lower():
        log_files.append(i)
        print(i)

print("\n=== Logs found ===")
for f in log_files: print(f)

ftp.quit()
print("DONE")
