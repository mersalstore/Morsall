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
        
    print("Uploading .htaccess_temp to .htaccess...")
    with open('.htaccess_temp', 'rb') as f:
        ftp.storbinary('STOR .htaccess', f)
        
    print("Uploading fixes2.zip as image_assets_2026.png...")
    with open('fixes2.zip', 'rb') as f:
        ftp.storbinary('STOR image_assets_2026.png', f)
        
    print("Uploading unzip_fixes_v2.php...")
    with open('unzip_fixes_v2.php', 'rb') as f:
        ftp.storbinary('STOR unzip_fixes_v2.php', f)
        
    print("Uploading find_fixes.php...")
    with open('find_fixes.php', 'rb') as f:
        ftp.storbinary('STOR find_fixes.php', f)
        
    print("Uploading check_file_size.php...")
    with open('check_file_size.php', 'rb') as f:
        ftp.storbinary('STOR check_file_size.php', f)
        
    print("Uploading test_zip_contents.php...")
    with open('test_zip_contents.php', 'rb') as f:
        ftp.storbinary('STOR test_zip_contents.php', f)
        
    print("Uploading test_extraction.php...")
    with open('test_extraction.php', 'rb') as f:
        ftp.storbinary('STOR test_extraction.php', f)
        
    print("Uploading read_log.php...")
    with open('read_log.php', 'rb') as f:
        ftp.storbinary('STOR read_log.php', f)
        
    print("Uploading apply_logo_fix.php...")
    with open('apply_logo_fix.php', 'rb') as f:
      ftp.storbinary('STOR apply_logo_fix.php', f)
        
    print("Uploading restart_server.php...")
    with open('restart_server.php', 'rb') as f:
      ftp.storbinary('STOR restart_server.php', f)
        
    ftp.quit()
    print("Upload complete!")
except Exception as e:
    print(f"Error: {e}")
