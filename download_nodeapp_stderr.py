import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    
    # Go to /nodeapp in FTP
    try:
        # Since we are locked to nodejs, we go up to home and then to nodeapp
        ftp.cwd("..")
        ftp.cwd("nodeapp")
        print("PWD:", ftp.pwd())
        print("Files in nodeapp:")
        print(ftp.nlst())
        
        # Download stderr.log
        if "stderr.log" in ftp.nlst():
            with open("nodeapp_stderr.log", "wb") as f:
                ftp.retrbinary("RETR stderr.log", f.write)
            print("Downloaded nodeapp_stderr.log")
            with open("nodeapp_stderr.log", "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
            print(f"Total lines: {len(lines)}")
            for line in lines[-30:]:
                print(line.strip())
        else:
            print("stderr.log not found in nodeapp")
            
        # Download server.log
        if "server.log" in ftp.nlst():
            with open("nodeapp_server.log", "wb") as f:
                ftp.retrbinary("RETR server.log", f.write)
            print("Downloaded nodeapp_server.log")
            with open("nodeapp_server.log", "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
            print(f"Total lines in server.log: {len(lines)}")
            for line in lines[-30:]:
                print(line.strip())
        else:
            print("server.log not found in nodeapp")
            
    except Exception as e:
        print(f"Error: {e}")
        
    ftp.quit()

if __name__ == "__main__":
    main()
