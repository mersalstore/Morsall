import ftplib

def restart_root_app():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        try:
            ftp.mkd("tmp")
        except:
            pass
        
        # Create/Touch restart.txt
        with open("empty.txt", "w") as f:
            f.write("")
        with open("empty.txt", "rb") as f:
            ftp.storbinary("STOR tmp/restart.txt", f)
        
        # Also rename server.js and back
        ftp.rename("server.js", "server.js.tmp")
        ftp.rename("server.js.tmp", "server.js")
        
        ftp.quit()
        print("Restarted app by touching tmp/restart.txt and renaming server.js")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    restart_root_app()
