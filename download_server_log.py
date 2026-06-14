import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    # Download server.log
    with open("remote_server.log", "wb") as f:
        ftp.retrbinary("RETR server.log", f.write)
    print("Downloaded remote server.log")
    
    with open("remote_server.log", "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    print(f"Total lines: {len(lines)}")
    for line in lines[-50:]:
        print(line.strip())
        
    ftp.quit()

if __name__ == "__main__":
    main()
