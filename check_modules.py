import ftplib

def check_modules():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        
        # Check sizes of key zips
        lines = []
        ftp.retrlines('LIST', lines.append)
        
        for line in lines:
            if any(x in line for x in ['node_modules', 'modules.zip', 'core_modules', 'next_at', 'remaining']):
                print(line)
                
    except Exception as e:
        print(f"Error: {e}")

check_modules()
