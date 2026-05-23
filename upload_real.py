import ftplib

def upload_over_dummy():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('app')
        with open('server_v2.js', 'rb') as f:
            ftp.storbinary('STOR app.js', f)
        ftp.quit()
        print("Uploaded server_v2.js to app/app.js")
    except Exception as e:
        print(f"Error: {e}")

upload_over_dummy()
