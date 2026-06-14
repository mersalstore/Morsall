import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    print("Files in current FTP folder:")
    for f in ftp.nlst():
        print(f)
    ftp.quit()

if __name__ == "__main__":
    main()
