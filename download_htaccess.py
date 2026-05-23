import ftplib

def download_file(remote_path, local_path):
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open(local_path, 'wb') as f:
            ftp.retrbinary('RETR ' + remote_path, f.write)
        ftp.quit()
        print(f"Downloaded {remote_path} to {local_path}")
    except Exception as e:
        print(f"Error: {e}")

download_file('.htaccess', 'htaccess_backup.txt')
