import ftplib

def upload_php_fix():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Upload in app_new - not in public_html root (which has Passenger)
        ftp.cwd('app_new')
        with open('extract_modules.php', 'rb') as f:
            ftp.storbinary('STOR fix.php', f)
        ftp.quit()
        print("Uploaded fix.php to app_new/fix.php")
    except Exception as e:
        print(f"Error: {e}")

upload_php_fix()
