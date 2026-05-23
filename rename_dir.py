import ftplib
import sys
import os

HOST = "82.198.228.182"
USER = "u754458241.morsall.com"
PASW = "l$9Qs3i]g0y]/V~k"

def connect_ftp():
    ftp = ftplib.FTP(HOST)
    ftp.login(USER, PASW)
    return ftp

def rename_dir(old_name, new_name):
    try:
        ftp = connect_ftp()
        ftp.rename(old_name, new_name)
        ftp.quit()
        print(f"Renamed {old_name} to {new_name}")
    except Exception as e:
        print(f"Error renaming: {e}")

if __name__ == "__main__":
    rename_dir(sys.argv[1], sys.argv[2])
