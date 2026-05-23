import os
import zipfile
import ftplib
import requests
import time

# --- Configuration ---
FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"
ZIP_NAME = "final_update.zip"
FIX_ZIP_NAME = "fix_modules.zip"
PHP_UNZIPPER = "force_unzip.php"
BASE_URL = "https://morsall.com"

def create_zip():
    print("Creating main deployment zip...")
    dirs_to_zip = ['.next', '_next', 'public']
    files_to_zip = ['server-hostinger.js', '.env.production', 'package.json', 'next.config.js', 'app.js']
    
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for d in dirs_to_zip:
            if os.path.exists(d):
                for root, _, files in os.walk(d):
                    if '.next' in root and 'cache' in root:
                        continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, os.getcwd())
                        zipf.write(file_path, arc_name)
        for f in files_to_zip:
            if os.path.exists(f):
                zipf.write(f, f)
    print(f"Created {ZIP_NAME} ({os.path.getsize(ZIP_NAME) // 1024} KB)")

def create_fix_zip():
    print("Creating fix zip (styled-jsx)...")
    with zipfile.ZipFile(FIX_ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        path = "node_modules/styled-jsx"
        if os.path.exists(path):
            for root, _, files in os.walk(path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, os.getcwd())
                    zipf.write(file_path, arc_name)
    print(f"Created {FIX_ZIP_NAME} ({os.path.getsize(FIX_ZIP_NAME) // 1024} KB)")

def upload_and_extract():
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        
        # Upload to app_new directory if it exists, otherwise root
        # Based on logs, the app is in /home/u754458241/domains/morsall.com/public_html/app_new
        # But FTP root seems to be /home/u754458241
        
        target_dir = "domains/morsall.com/public_html/app_new"
        try:
            ftp.cwd(target_dir)
            print(f"Switched to {target_dir}")
        except:
            print(f"Could not switch to {target_dir}, trying public_html/app_new")
            try:
                ftp.cwd("public_html/app_new")
            except:
                print("Could not find app_new, uploading to root")

        print(f"Uploading {ZIP_NAME}...")
        with open(ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {ZIP_NAME}", f)
            
        print(f"Uploading {FIX_ZIP_NAME}...")
        with open(FIX_ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {FIX_ZIP_NAME}", f)
        
        # Ensure force_unzip.php is there
        if os.path.exists("force_unzip.php"):
            print("Uploading force_unzip.php...")
            with open("force_unzip.php", "rb") as f:
                ftp.storbinary(f"STOR force_unzip.php", f)
            
        ftp.quit()
        print("Upload complete!")
        
        print("Triggering extraction via PHP...")
        # Note: the PHP script needs to be accessible via URL
        # If it's in app_new, we need to access it there
        # Let's assume there's a copy in public_html too
        
        # We'll try to trigger it in app_new
        r = requests.get(f"{BASE_URL}/app_new/force_unzip.php?file={ZIP_NAME}", verify=False)
        print("Main Zip Output:", r.status_code)
        
        r = requests.get(f"{BASE_URL}/app_new/force_unzip.php?file={FIX_ZIP_NAME}", verify=False)
        print("Fix Zip Output:", r.status_code)
        
        # Trigger restart
        requests.get(f"{BASE_URL}/app_new/touch_restart.php", verify=False)
        print("Restart triggered.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_zip()
    create_fix_zip()
    upload_and_extract()
    # Cleanup
    # if os.path.exists(ZIP_NAME): os.remove(ZIP_NAME)
    # if os.path.exists(FIX_ZIP_NAME): os.remove(FIX_ZIP_NAME)
