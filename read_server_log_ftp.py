import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")
        
        # Download the last 200 lines of server.log
        ftp.cwd("/nodejs")
        with open("server_state_log.txt", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        print("Downloaded server.log")
        ftp.quit()
        
        # Print last 100 lines
        with open("server_state_log.txt", "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            print("\n=== Last 100 lines of server.log ===")
            for line in lines[-100:]:
                print(line.strip())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
