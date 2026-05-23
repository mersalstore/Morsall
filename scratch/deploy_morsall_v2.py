import os
import zipfile
import ftplib
import requests
import time

# --- Configuration ---
FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"
ZIP_NAME = "morsall_update_v2.zip"
TARGET_DIR = "" # FTP root is already the app root
BASE_URL = "https://morsall.com"

def create_zip():
    print("Creating deployment zip...")
    # Essential folders and files for Next.js Standalone/Hostinger setup
    dirs_to_zip = ['.next', '_next', 'public', 'prisma']
    files_to_zip = [
        'server-hostinger.js', 
        '.env.production', 
        'package.json', 
        'next.config.js', 
        '.htaccess',
        'app.js'
    ]
    
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for d in dirs_to_zip:
            if os.path.exists(d):
                print(f"  Zipping directory: {d}")
                for root, _, files in os.walk(d):
                    if '.next' in root and 'cache' in root:
                        continue
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, os.getcwd())
                        zipf.write(file_path, arc_name)
        
        for f in files_to_zip:
            if os.path.exists(f):
                print(f"  Zipping file: {f}")
                zipf.write(f, f)
            else:
                print(f"  Warning: {f} not found locally")

    print(f"Created {ZIP_NAME} ({os.path.getsize(ZIP_NAME) // (1024*1024)} MB)")

def upload_and_extract():
    try:
        print("Connecting to FTP...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        
        if TARGET_DIR:
            try:
                ftp.cwd(TARGET_DIR)
                print(f"Switched to {TARGET_DIR}")
            except:
                print(f"Failed to switch to {TARGET_DIR}")
                return
        else:
            print("Using FTP root directory")

        print(f"Uploading {ZIP_NAME}...")
        with open(ZIP_NAME, "rb") as f:
            ftp.storbinary(f"STOR {ZIP_NAME}", f)
            
        # Create a small PHP helper for unzipping if it doesn't exist
        unzip_php = f"""<?php
        $zip = new ZipArchive;
        $file = '{ZIP_NAME}';
        if ($zip->open($file) === TRUE) {{
            $zip->extractTo('./');
            $zip->close();
            echo 'Extraction complete!';
        }} else {{
            echo 'Failed to open ' . $file;
        }}
        unlink($file); // Cleanup zip after extraction
        ?>"""
        
        import io
        print("Uploading unzip_helper.php...")
        ftp.storbinary("STOR unzip_helper.php", io.BytesIO(unzip_php.encode('utf-8')))
        
        # Ensure touch_restart.php exists
        restart_php = """<?php
        @mkdir('tmp', 0777, true);
        touch('tmp/restart.txt');
        echo 'Restart triggered!';
        ?>"""
        print("Uploading touch_restart.php...")
        ftp.storbinary("STOR touch_restart.php", io.BytesIO(restart_php.encode('utf-8')))

        ftp.quit()
        print("Upload complete!")
        
        print("Triggering extraction via URL...")
        time.sleep(2)
        r = requests.get(f"{BASE_URL}/unzip_helper.php", verify=False)
        print("Extraction Result:", r.text)
        
        print("Triggering restart...")
        r = requests.get(f"{BASE_URL}/touch_restart.php", verify=False)
        print("Restart Result:", r.text)

    except Exception as e:
        print(f"Error during deployment: {e}")

if __name__ == "__main__":
    create_zip()
    upload_and_extract()
