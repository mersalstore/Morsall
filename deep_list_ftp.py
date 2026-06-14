import ftplib

def walk(ftp, path=""):
    print(f"\nWalking path: {path or '/'}")
    try:
        ftp.cwd(path or "/")
        items = []
        ftp.dir(items.append)
        for item in items:
            print(f"  {item}")
    except Exception as e:
        print(f"  Error walking {path}: {e}")

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    walk(ftp, "")
    walk(ftp, "nodejs")
    walk(ftp, "domains")
    walk(ftp, "domains/morsall.com")
    walk(ftp, "public_html")
    
    ftp.quit()

if __name__ == "__main__":
    main()
