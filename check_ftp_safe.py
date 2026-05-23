import ftplib

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

try:
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    print("Logged in successfully!")
    
    # Go up one directory to reach the real domain root
    try:
        ftp.cwd("..")
        print("Moved to parent directory!")
        print("Parent directory files:", ftp.nlst())
        
        # Now try to CWD to public_html
        try:
            ftp.cwd("public_html")
            print("CWD to public_html succeeded! Files:", ftp.nlst()[:10])
            ftp.cwd("..")
        except Exception as e:
            print("CWD to public_html failed:", e)
            
        # Try to CWD to nodejs
        try:
            ftp.cwd("nodejs")
            print("CWD to nodejs succeeded! Files:", ftp.nlst()[:10])
            ftp.cwd("..")
        except Exception as e:
            print("CWD to nodejs failed:", e)
            
    except Exception as e:
        print("Could not go up a directory:", e)
        
    ftp.quit()
except Exception as e:
    print("Error:", e)
