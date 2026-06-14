import ftplib

def list_recursive(ftp, path=""):
    try:
        ftp.cwd(path)
        items = ftp.nlst()
        for item in items:
            if item in [".", ".."]:
                continue
            full_path = f"{path}/{item}" if path else item
            try:
                # Try to enter directory
                ftp.cwd(item)
                ftp.cwd("..")
                # If we succeeded, it's a directory
                list_recursive(ftp, full_path)
            except Exception:
                # It's a file
                if item.endswith(".log") or "log" in item.lower() or item.endswith(".txt") or "err" in item.lower():
                    print(f"File: {full_path}")
    except Exception as e:
        print(f"Error listing {path}: {e}")

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

try:
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Listing log files:")
    list_recursive(ftp)
    ftp.quit()
except Exception as e:
    print(f"FTP error: {e}")
