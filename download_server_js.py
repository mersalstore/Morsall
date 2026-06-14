import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    # Download server.js
    with open("remote_server.js", "wb") as f:
        ftp.retrbinary("RETR server.js", f.write)
    print("Downloaded remote server.js")
    
    with open("remote_server.js", "r", encoding="utf-8") as f:
        print(f.read())
        
    ftp.quit()

if __name__ == "__main__":
    main()
