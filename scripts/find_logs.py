import ftplib

def find_server_log(ftp, path):
    try:
        ftp.cwd(path)
        print(f"Checking {path}...")
        files = ftp.nlst()
        if "server.log" in files:
            size = ftp.size("server.log")
            print(f"!!! FOUND server.log in {path} (Size: {size})")
        
        for f in files:
            if f not in [".", ".."]:
                try:
                    # Check if it's a directory
                    ftp.cwd(f)
                    ftp.cwd("..")
                    find_server_log(ftp, path + "/" + f if path != "/" else "/" + f)
                    ftp.cwd(path)
                except:
                    pass
    except Exception as e:
        pass

def start_search():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.voidcmd('TYPE I')
        find_server_log(ftp, "/")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    start_search()
