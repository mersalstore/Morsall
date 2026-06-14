import ftplib

def list_to_file():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        
        with open("ftp_root_listing.txt", "w") as f:
            ftp.cwd("/")
            ftp.retrlines('LIST -a', lambda line: f.write(line + "\n"))
            
        print("Done listing root.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

list_to_file()
