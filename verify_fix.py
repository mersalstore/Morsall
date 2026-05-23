import ftplib

def verify_fix():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('app_new')
        # Download fix.php to verify content
        with open('current_fix_php.txt', 'wb') as f:
            ftp.retrbinary('RETR fix.php', f.write)
        ftp.quit()
        print("Downloaded current fix.php")
    except Exception as e:
        print(f"Error: {e}")

verify_fix()
