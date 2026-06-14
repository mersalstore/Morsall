import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")

        # Touch restart.txt in nodejs/tmp to trigger Passenger reload
        try:
            ftp.cwd("/nodejs/tmp")
        except:
            try:
                ftp.mkd("/nodejs/tmp")
                ftp.cwd("/nodejs/tmp")
            except:
                pass
        
        import io
        ftp.storbinary("STOR restart.txt", io.BytesIO(b"restart"))
        print("Uploaded restart.txt to /nodejs/tmp - Passenger should restart now.")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
