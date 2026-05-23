import ftplib

def find_next():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        
        # Check nodejs_backup
        ftp.cwd('..')
        print("Home dirs:", ftp.nlst())
        
        try:
            ftp.cwd('nodejs_backup_1778489634')
            items = ftp.nlst()
            print("nodejs_backup contents:", items[:15])
            try:
                ftp.cwd('node_modules')
                nm = ftp.nlst()
                print("node_modules in backup has", len(nm), "items")
                if 'next' in nm:
                    print(">>> FOUND 'next' in nodejs_backup/node_modules <<<")
            except Exception as e:
                print("No node_modules:", e)
        except Exception as e:
            print("nodejs_backup error:", e)
            
    except Exception as e:
        print(f"Error: {e}")

find_next()
