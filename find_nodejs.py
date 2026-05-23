import ftplib

def check_nodejs():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("..")
        print("In Domains:", ftp.nlst())
        # The user's FTP login might put them in public_html or domains/morsall.com
        # Let's try to find nodejs
        try:
            ftp.cwd("nodejs")
            print("Found nodejs!")
            print("Contents:", ftp.nlst()[:10])
        except:
            print("nodejs NOT found at root level")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

check_nodejs()
