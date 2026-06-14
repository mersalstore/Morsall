import ftplib

def list_detailed(ftp, path=""):
    try:
        print(f"\n--- Detailed Listing for '{path}' ---")
        ftp.cwd(path)
        ftp.retrlines('LIST -a')
    except Exception as e:
        print(f"Error listing {path}: {e}")

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

try:
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    list_detailed(ftp, "/")
    list_detailed(ftp, "/nodejs")
    list_detailed(ftp, "/public_html")
    ftp.quit()
except Exception as e:
    print(f"FTP error: {e}")
