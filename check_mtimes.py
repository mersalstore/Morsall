import ftplib
import time

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)

try:
    ftp.cwd("/nodejs")
    files = ftp.nlst()
    for f in files:
        try:
            mtime = ftp.voidcmd(f"MDTM {f}").split()[1]
            # Parse MDTM response YYYYMMDDHHMMSS
            t_struct = time.strptime(mtime, "%Y%m%d%H%M%S")
            formatted_time = time.strftime("%Y-%m-%d %H:%M:%S GMT", t_struct)
            print(f"{f:<30} : {formatted_time}")
        except Exception as e:
            print(f"{f:<30} : Error {e}")
except Exception as e:
    print("Error:", e)

ftp.quit()
