import ftplib
def restore_all():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        # Restore htaccess
        htaccess_content = """
PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs
PassengerAppType node
PassengerStartupFile server-hostinger.js
"""
        with open('remote_htaccess.txt', 'wb') as f:
            f.write(htaccess_content.encode())
        with open('remote_htaccess.txt', 'rb') as f:
            ftp.storbinary('STOR .htaccess', f)
        # Restore server script
        ftp.cwd("/nodejs")
        try:
            ftp.rename("server-hostinger.js.bak", "server-hostinger.js")
        except:
            pass
        ftp.quit()
        print("Restored htaccess and server script.")
    except Exception as e:
        print(f"Error: {e}")
restore_all()
