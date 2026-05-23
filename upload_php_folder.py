import ftplib

def upload_to_php_folder():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in.")
        
        try:
            ftp.mkd("php")
            print("Created php directory.")
        except:
            print("php directory already exists.")
            
        ftp.cwd("php")
        
        files = {
            "php_htaccess": ".htaccess",
            "force_unzip.php": "force_unzip.php",
            "sync_to_nodejs.php": "sync_to_nodejs.php",
            "test_php.php": "test.php"
        }
        
        for local, remote in files.items():
            print(f"Uploading {local} as {remote}...")
            with open(local, "rb") as f:
                ftp.storbinary(f"STOR {remote}", f)
        
        ftp.quit()
        print("Done!")
    except Exception as e:
        print(f"Failed: {e}")

upload_to_php_folder()
