import ftplib
import io

def restore():
    print("Connecting to FTP...")
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    print("Connected successfully!")
    
    # 1. Restore .htaccess
    print("Restoring .htaccess...")
    ftp.cwd('/public_html')
    try:
        ftp.rename('.htaccess.backup', '.htaccess')
        print("Successfully enabled .htaccess!")
    except Exception as e:
        print("Error/Warning renaming .htaccess.backup:", e)
        
    # 2. Touch tmp/restart.txt
    print("Restarting Passenger...")
    ftp.cwd('/nodejs')
    try:
        ftp.cwd('tmp')
    except Exception:
        ftp.mkd('tmp')
        ftp.cwd('tmp')
        
    in_txt = io.BytesIO(b"restart")
    ftp.storbinary("STOR restart.txt", in_txt)
    print("Successfully touched tmp/restart.txt!")
    
    # 3. Clean up the remote_prisma_generate.php script
    print("Cleaning up remote_prisma_generate.php...")
    ftp.cwd('/public_html')
    try:
        ftp.delete('remote_prisma_generate.php')
        print("Successfully deleted remote_prisma_generate.php!")
    except Exception as e:
        print("Warning deleting remote_prisma_generate.php:", e)
        
    ftp.quit()
    print("Finished restoring!")

if __name__ == '__main__':
    restore()
