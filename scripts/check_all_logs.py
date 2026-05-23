import ftplib

def check_all_logs():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.voidcmd('TYPE I')
        
        paths = [
            "/public_html/app_new",
            "/public_html",
            "/app"
        ]
        
        for p in paths:
            print(f"--- Path: {p} ---")
            try:
                ftp.cwd(p)
                files = ftp.nlst()
                for f in ["server.log", "stderr.log"]:
                    if f in files:
                        print(f"  {f}: {ftp.size(f)} bytes")
                    else:
                        print(f"  {f}: NOT FOUND")
            except Exception as e:
                print(f"  Error accessing path: {e}")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_all_logs()
