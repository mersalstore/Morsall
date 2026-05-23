import ftplib
import os

def nuke_backslashes(ftp, path):
    try:
        items = ftp.nlst(path)
    except:
        return

    for item in items:
        # Get the basename (some FTPs return full path, some just name)
        name = os.path.basename(item)
        if '\\' in name:
            print(f"Nuking: {item}")
            try:
                # Try to delete as file first
                ftp.delete(item)
            except:
                try:
                    # If it's a directory, we'd need recursive delete, but usually these are files or empty shells
                    ftp.rmd(item)
                except Exception as e:
                    print(f"Failed to delete {item}: {e}")
        else:
            # Recurse if it's a directory
            # Note: Checking if it's a dir in FTP is tricky, usually try-except CWD
            old_cwd = ftp.pwd()
            try:
                ftp.cwd(item)
                nuke_backslashes(ftp, ftp.pwd())
                ftp.cwd(old_cwd)
            except:
                pass

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    
    print("Starting FTP Nuke in nodeapp...")
    # nodeapp is likely at /nodeapp relative to root if root is /home/u754458241
    # But wait, previous list showed public_html at root.
    # So nodeapp is likely at ../nodeapp
    
    try:
        ftp.cwd('/nodeapp')
    except:
        try:
            ftp.cwd('../nodeapp')
        except:
            print("Could not find nodeapp directory via FTP")
            ftp.quit()
            exit()
            
    nuke_backslashes(ftp, ftp.pwd())
    print("FTP Nuke complete!")
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
