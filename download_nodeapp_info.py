import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    # Download nodeapp_info.txt
    try:
        with open("remote_nodeapp_info.txt", "wb") as f:
            ftp.retrbinary("RETR nodeapp_info.txt", f.write)
        print("Downloaded nodeapp_info.txt")
        
        with open("remote_nodeapp_info.txt", "r", encoding="utf-8", errors="replace") as f:
            print(f.read())
    except Exception as e:
        print(f"Error: {e}")
        
    ftp.quit()

if __name__ == "__main__":
    main()
