import ftplib

def restart_app():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("app_new")
        
        # Ensure tmp exists
        try:
            ftp.mkd("tmp")
        except:
            pass
        
        # Create/Touch restart.txt
        ftp.cwd("tmp")
        with open("empty.txt", "w") as f:
            f.write("")
        with open("empty.txt", "rb") as f:
            ftp.storbinary("STOR restart.txt", f)
        
        ftp.cwd("..")
        ftp.voidcmd("MDTM start_morsall.js") # Just a check
        # Touching files by re-uploading them or similar is sometimes needed
        # But MDTM doesn't change it. We can try to rename and rename back.
        ftp.rename("start_morsall.js", "start_morsall.js.tmp")
        ftp.rename("start_morsall.js.tmp", "start_morsall.js")
        
        ftp.quit()
        print("Restarted app by touching restart.txt and renaming start_morsall.js")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    restart_app()
