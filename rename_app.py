import ftplib

def rename_app():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('app_new')
        try:
            ftp.delete('start_morsall.js')
        except:
            pass
        ftp.rename('app.js', 'start_morsall.js')
        ftp.quit()
        print("Renamed app.js to start_morsall.js")
    except Exception as e:
        print(f"Error: {e}")

rename_app()
