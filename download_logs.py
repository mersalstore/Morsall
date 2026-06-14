import ftplib
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)

def download_file(remote_path, local_path):
    print(f"Downloading {remote_path}...")
    try:
        with open(local_path, "wb") as f:
            ftp.retrbinary(f"RETR {remote_path}", f.write)
        print("  Downloaded successfully.")
    except Exception as e:
        print(f"  Error: {e}")

try:
    ftp.cwd("/nodejs")
    download_file(".env", "remote_env_check.txt")
    download_file("server.log", "remote_server.log")
    download_file("stderr.log", "remote_stderr.log")
    
    # Check if there is public_html/error_log or similar
    ftp.cwd("/public_html")
    download_file("error_log", "remote_error_log")
except Exception as e:
    print(f"General Error: {e}")

ftp.quit()
