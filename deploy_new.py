import ftplib
import os
import requests
import zipfile

# --- Configuration ---
FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"
ZIP_NAME = "final_update.zip"
FIX_ZIP_NAME = "fix_modules.zip"
BASE_URL = "https://morsall.com"

def create_zips():
    print("1. Creating final_update.zip...")
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
    print(f"   Created {ZIP_NAME} ({os.path.getsize(ZIP_NAME) // 1024} KB)")

    print("2. Creating fix_modules.zip...")
    with zipfile.ZipFile(FIX_ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        path = "node_modules/styled-jsx"
        if os.path.exists(path):
            for root, _, files in os.walk(path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, os.getcwd())
                    zipf.write(file_path, arc_name)
    print(f"   Created {FIX_ZIP_NAME} ({os.path.getsize(FIX_ZIP_NAME) // 1024} KB)")

def upload_and_extract():
    try:
        print("3. Connecting to FTP...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("   Logged in!")
        
        # Navigate up one level to domain root
        ftp.cwd("..")
        print("   Navigated to domain root!")

        # Upload unzip.php to public_html
        print("4. Uploading unzip.php to public_html...")
        ftp.cwd("public_html")
        with open("unzip.php", "rb") as f:
            ftp.storbinary("STOR unzip.php", f)
        ftp.cwd("..")
        
        # Upload zips to nodejs
        print("5. Uploading final_update.zip and fix_modules.zip to nodejs...")
        ftp.cwd("nodejs")
        with open(ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {ZIP_NAME}", f)
        with open(FIX_ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {FIX_ZIP_NAME}", f)
        ftp.cwd("..")
        
        # Touch restart.txt in tmp
        print("6. Touching restart.txt to queue server restart...")
        try:
            ftp.cwd("tmp")
            # Create or update restart.txt
            with open("temp_restart.txt", "w") as f:
                f.write("restart")
            with open("temp_restart.txt", "rb") as f:
                ftp.storbinary("STOR restart.txt", f)
            os.remove("temp_restart.txt")
            ftp.cwd("..")
            print("   restart.txt touched!")
        except Exception as e:
            print("   Failed to touch restart.txt:", e)

        ftp.quit()
        print("   FTP operations completed!")
        
        # Trigger unzipping
        print("7. Triggering extraction via browser request...")
        
        # Unzip main build
        url_main = f"{BASE_URL}/unzip.php?file=../nodejs/{ZIP_NAME}&target=../nodejs"
        print(f"   Requesting: {url_main}")
        r = requests.get(url_main, verify=False)
        print("   Response:", r.text)
        
        # Unzip fix modules
        url_fix = f"{BASE_URL}/unzip.php?file=../nodejs/{FIX_ZIP_NAME}&target=../nodejs"
        print(f"   Requesting: {url_fix}")
        r = requests.get(url_fix, verify=False)
        print("   Response:", r.text)
        
    except Exception as e:
        print("Error during upload/extract:", e)

if __name__ == "__main__":
    create_zips()
    upload_and_extract()
