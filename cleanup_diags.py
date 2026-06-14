import ftplib
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
ftp.cwd("/public_html")

for f in ["fix_db_schema.php", "fix_prisma_engine.php", "diag_db.php"]:
    try:
        ftp.delete(f)
        print(f"Deleted: {f}")
    except Exception as e:
        print(f"Skip {f}: {e}")

ftp.quit()
print("DONE")
