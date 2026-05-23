import ftplib
import io

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    try:
        ftp.mkd('uploads')
    except:
        pass
    ftp.cwd('uploads')
    
    # Upload test image
    with open('test_image.png', 'rb') as f:
        ftp.storbinary('STOR test_image.png', f)
        
    ftp.quit()
    print("Upload complete!")
except Exception as e:
    print(f"Error: {e}")
