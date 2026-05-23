import ftplib

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    
    with open('final_verify.txt', 'wb') as f:
        ftp.retrbinary('RETR nodeapp_final_check.txt', f.write)
    
    with open('final_verify.txt', 'r') as f:
        lines = f.readlines()
        backslashes = [l.strip() for l in lines if '\\' in l]
        if backslashes:
            print("FOUND BACKSLASHES:")
            for b in backslashes: print(b)
        else:
            print("CLEAN! No backslashes found in nodeapp root.")
            
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
