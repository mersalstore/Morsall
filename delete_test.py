import ftplib

def delete_app_js():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('app')
        ftp.delete('app.js')
        ftp.quit()
        print("Deleted app/app.js")
    except Exception as e:
        print(f"Error: {e}")

delete_app_js()
