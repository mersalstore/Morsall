import ftplib

def list_to_file():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        
        with open("ftp_nodejs_listing.txt", "w") as f:
            ftp.cwd("/nodejs")
            ftp.retrlines('LIST -a', lambda line: f.write(line + "\n"))
            
        print("Done listing nodejs.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

list_to_file()
