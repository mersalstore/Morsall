import ftplib

def touch_all_restarts():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        
        paths = ["/public_html/app_new/tmp", "/public_html/tmp", "/app/tmp"]
        for p in paths:
            try:
                ftp.cwd(p)
                with open("empty.txt", "w") as f: f.write("")
                with open("empty.txt", "rb") as f:
                    ftp.storbinary("STOR restart.txt", f)
                print(f"Touched {p}/restart.txt")
            except:
                print(f"Could not touch {p}/restart.txt")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    touch_all_restarts()
