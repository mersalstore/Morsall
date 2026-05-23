import ftplib

def rename_nodeapp_app():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('/')
        ftp.cwd('app')
        try:
            ftp.delete('app.js')
        except:
            pass
        ftp.rename('start_morsall.js', 'app.js')
        ftp.quit()
        print("Renamed start_morsall.js to app.js in 'app' folder")
    except Exception as e:
        print(f"Error: {e}")

rename_nodeapp_app()
