import ftplib

def check_nodeapp():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        try:
            ftp.cwd("/nodeapp")
            print("Successfully entered /nodeapp")
            print("Files in /nodeapp:", ftp.nlst())
        except Exception as e:
            print(f"Error entering /nodeapp: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_nodeapp()
