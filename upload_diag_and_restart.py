import ftplib

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        
        # Upload query_db_diagnostics.js
        with open("query_db_diagnostics.js", "rb") as f:
            ftp.storbinary("STOR query_db_diagnostics.js", f)
        print("Uploaded updated query_db_diagnostics.js.")
        
        # Upload restart.txt to tmp folder to trigger reload
        try:
            ftp.cwd("/nodejs/tmp")
        except:
            ftp.mkd("/nodejs/tmp")
            ftp.cwd("/nodejs/tmp")
            
        try:
            ftp.storbinary("STOR restart.txt", open("empty.txt", "rb"))
            print("Uploaded restart.txt to trigger reload.")
        except Exception as e:
            print(f"Failed to upload restart.txt: {e}")
            
        ftp.quit()
        print("\nSUCCESS: Diagnostics updated and restart triggered. Please reload the website in your browser.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
