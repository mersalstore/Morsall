import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")
        print("PWD:", ftp.pwd())

        # Check what's in /nodejs
        print("\n/nodejs contents:")
        ftp.cwd("/nodejs")
        ftp.dir()
        
        print("\n/nodejs/tmp contents:")
        try:
            ftp.cwd("/nodejs/tmp")
            ftp.dir()
        except Exception as e:
            print(f"  (no /tmp folder or error: {e})")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
