import ftplib

def explore_app_new_next():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('app_new')
        
        # List only top-level entries
        items = []
        def add_item(x):
            items.append(x)
        ftp.retrlines('NLST -la', add_item)
        
        # Filter for directories and key files
        print("app_new top-level (first 30):")
        for item in items[:30]:
            print(" ", item)
            
    except Exception as e:
        try:
            ftp2 = ftplib.FTP('82.198.228.182')
            ftp2.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
            ftp2.cwd('app_new')
            # Try basic nlst but filter
            all_items = ftp2.nlst()
            # Get unique top level dirs (before first /)
            top = set()
            for item in all_items:
                parts = item.replace('\\', '/').split('/')
                top.add(parts[0])
            print("Top-level dirs in app_new:", sorted(top)[:30])
        except Exception as e2:
            print(f"Error: {e2}")

explore_app_new_next()
