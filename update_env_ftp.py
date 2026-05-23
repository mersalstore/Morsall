import ftplib
import io

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    ftp.cwd('..')
    ftp.cwd('nodejs')
    
    # Download .env
    lines = []
    ftp.retrlines('RETR .env', lines.append)
    env_content = "\n".join(lines)
    
    # Add UPLOAD_DIR
    if "UPLOAD_DIR" not in env_content:
        env_content += "\nUPLOAD_DIR=/home/u754458241/domains/morsall.com/public_html/uploads\n"
        
        # Upload .env back
        bio = io.BytesIO(env_content.encode('utf-8'))
        ftp.storbinary('STOR .env', bio)
        print("Successfully updated .env with UPLOAD_DIR")
    else:
        print("UPLOAD_DIR already exists in .env")
        
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
