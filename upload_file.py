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

def upload_file(local_path, remote_path):
    try:
        ftp = connect_ftp()
        with open(local_path, "rb") as file:
            ftp.storbinary(f"STOR {remote_path}", file)
        ftp.quit()
        print(f"Uploaded {local_path} to {remote_path}")
    except Exception as e:
        print(f"Error: {e}")

def delete_file(remote_path):
    try:
        ftp = connect_ftp()
        ftp.delete(remote_path)
        ftp.quit()
        print(f"Deleted {remote_path}")
    except Exception as e:
        print(f"Error deleting {remote_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python upload_file.py <local_path> <remote_path> OR python upload_file.py --delete <remote_path>")
    elif sys.argv[1] == "--delete":
        delete_file(sys.argv[2])
    else:
        if len(sys.argv) < 3:
             print("Usage: python upload_file.py <local_path> <remote_path>")
        else:
             upload_file(sys.argv[1], sys.argv[2])
