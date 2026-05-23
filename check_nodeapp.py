import ftplib

def check_nodeapp():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('/')
        items = ftp.nlst()
        print(f"Root contents: {items}")
        if 'nodeapp' in items:
            print("nodeapp EXISTS")
            ftp.cwd('nodeapp')
            print(f"nodeapp contents: {ftp.nlst()}")
        else:
            print("nodeapp NOT FOUND in root")
        
        if 'app' in items:
            print("app EXISTS")
            ftp.cwd('/app')
            print(f"app contents: {ftp.nlst()}")
            
    except Exception as e:
        print(f"Error: {e}")

check_nodeapp()
