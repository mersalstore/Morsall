import os
import zipfile
import ftplib
import requests
import time

# --- Configuration ---
FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"
ZIP_NAME = "automated_update.zip"
PHP_UNZIPPER = "force_unzip.php"
BASE_URL = "https://morsall.com"

def create_zip():
    print("Creating deployment zip...")
    dirs_to_zip = ['.next', '_next', 'public']
    files_to_zip = ['server-hostinger.js', '.env.production', 'package.json', 'next.config.js']
    
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Walk and zip directories
        for d in dirs_to_zip:
            if os.path.exists(d):
                for root, _, files in os.walk(d):
                    if '.next' in root and 'cache' in root:
                        continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        # Archive path should be exactly what's on server
                        # .next/... -> .next/...
                        arc_name = os.path.relpath(file_path, os.getcwd())
                        zipf.write(file_path, arc_name)
        # Add files
        for f in files_to_zip:
            if os.path.exists(f):
                zipf.write(f, f)
    print(f"Created {ZIP_NAME} ({os.path.getsize(ZIP_NAME) // 1024} KB)")

def upload_and_extract():
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.cwd("/public_html")
        
        print(f"Uploading {ZIP_NAME}...")
        with open(ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {ZIP_NAME}", f)
        
        print(f"Uploading {PHP_UNZIPPER}...")
        # Use the force_unzip.php we created earlier
        with open("force_unzip.php", "rb") as f:
            ftp.storbinary(f"STOR {PHP_UNZIPPER}", f)
            
        ftp.quit()
        print("Upload complete!")
        
        print("Triggering extraction...")
        time.sleep(1)
        # Use verify=False for SSL flexibility
        r = requests.get(f"{BASE_URL}/{PHP_UNZIPPER}", verify=False)
        print("Server Output:")
        print(r.text)
        
        if "Extraction complete!" in r.text:
            print("Deployment successful!")
        else:
            print("Deployment check failed. See server output.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_zip()
    upload_and_extract()
    # Cleanup
    if os.path.exists(ZIP_NAME): os.remove(ZIP_NAME)
