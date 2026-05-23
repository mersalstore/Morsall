import ftplib
import os

def upload_via_ftp():
    host = '82.198.228.182'
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    local_file = r'c:\Users\hazem\Downloads\matger2\scripts\fix_admin_access.php'
    remote_file = 'domains/morsall.com/public_html/fix_admin.php'
    
    try:
        print(f"Connecting to FTP {host}...")
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in. Uploading...")
        
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {remote_file}', f)
        
        ftp.quit()
        print(f"Successfully uploaded to {remote_file} via FTP")
        return True
    except Exception as e:
        print(f"FTP Error: {e}")
        return False

if __name__ == "__main__":
    upload_via_ftp()
