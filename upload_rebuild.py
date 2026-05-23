import ftplib
import os
import sys

def upload_large_file():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    filename = "fast_update.zip"
    
    print(f"Connecting to {host}...")
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.voidcmd('TYPE I')
        print("Login successful!")
        print(f"Initial PWD: {ftp.pwd()}")
        
        # Navigate to the correct directory!
        try:
            ftp.cwd('domains/morsall.com/public_html')
            print("Successfully navigated to domains/morsall.com/public_html")
        except Exception as e:
            print(f"Warning: could not change directory to public_html: {e}")

        # Upload zip to current dir
        print(f"Target PWD: {ftp.pwd()}")
        filesize = os.path.getsize(filename)
        print(f"Uploading {filename} ({filesize / 1024 / 1024:.2f} MB)...")
        
        with open(filename, "rb") as file:
            def callback(data):
                callback.uploaded += len(data)
                percent = (callback.uploaded / filesize) * 100
                sys.stdout.write(f"\rProgress: {percent:.2f}%")
                sys.stdout.flush()
            
            callback.uploaded = 0
            ftp.storbinary(f"STOR {filename}", file, blocksize=1024*1024, callback=callback)
            print(f"\nSuccessfully uploaded {filename}")
            
        print("Uploading emergency_deploy.php...")
        with open("emergency_deploy.php", "rb") as f2:
            ftp.storbinary("STOR emergency_deploy.php", f2)
            print("Successfully uploaded emergency_deploy.php")
            
        ftp.quit()
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    upload_large_file()
