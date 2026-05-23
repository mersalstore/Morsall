import ftplib

def check_dir(dir_path):
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd(dir_path)
        print(f"Contents of {dir_path}:", ftp.nlst())
        ftp.quit()
    except Exception as e:
        print(f"Error checking {dir_path}: {e}")

check_dir('/app')
