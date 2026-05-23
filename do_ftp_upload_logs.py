import ftplib
import sys

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    
    print("Navigating to public_html...")
    try:
        ftp.cwd('..')
        ftp.cwd('public_html')
    except Exception as e:
        print("Failed to cwd to public_html.")
        print(e)
        ftp.quit()
        sys.exit(1)
        
    print("Uploading .htaccess_temp...")
    with open('.htaccess_temp', 'rb') as f:
        ftp.storbinary('STOR .htaccess', f)
        
    ftp.quit()
    print("Upload complete!")
except Exception as e:
    print(f"Error: {e}")
