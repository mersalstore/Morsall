import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    # Download nodeapp_listing.txt
    try:
        with open("remote_nodeapp_listing.txt", "wb") as f:
            ftp.retrbinary("RETR nodeapp_listing.txt", f.write)
        print("Downloaded nodeapp_listing.txt")
        
        with open("remote_nodeapp_listing.txt", "r", encoding="utf-8", errors="replace") as f:
            print(f.read())
    except Exception as e:
        print(f"Error: {e}")
        
    ftp.quit()

if __name__ == "__main__":
    main()
