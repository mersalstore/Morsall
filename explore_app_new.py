import ftplib

def explore():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        
        # Check app_new contents
        ftp.cwd('app_new')
        print("app_new contents:", ftp.nlst())
        
        # Check if node_modules exists in app_new
        try:
            ftp.cwd('node_modules')
            items = ftp.nlst()
            print("node_modules has", len(items), "items")
            print("First 10:", items[:10])
        except Exception as e:
            print("No node_modules in app_new:", e)
            
    except Exception as e:
        print(f"Error: {e}")

explore()
