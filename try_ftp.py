import ftplib

def try_nodeapp():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("..")
        print("In Home:", ftp.nlst())
        ftp.cwd("nodeapp")
        print("In Nodeapp:", ftp.nlst())
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

try_nodeapp()
