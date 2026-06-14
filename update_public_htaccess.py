import ftplib

def upload_public_htaccess():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    htaccess_content = """PassengerEnabled on
PassengerAppType node
PassengerStartupFile server.js
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs
PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node
PassengerLogFile /home/u754458241/domains/morsall.com/nodejs/passenger.log
PassengerMinInstances 1
PassengerPoolIdleTime 0

Options -MultiViews -Indexes
RewriteEngine On
RewriteBase /

# EXCLUDE PHP AND DIAGNOSTIC SCRIPTS
RewriteCond %{REQUEST_URI} \\.(php|html|png|jpg|jpeg|gif|ico)$ [NC]
RewriteRule .* - [L]

RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)/$ /$1 [L,R=301]
"""
    
    try:
        # Save locally first
        with open("new_public_htaccess.txt", "w", encoding="utf-8") as f:
            f.write(htaccess_content)
            
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        
        # Upload as .htaccess
        with open("new_public_htaccess.txt", "rb") as f:
            ftp.storbinary("STOR .htaccess", f)
            
        print("Successfully uploaded new .htaccess to public_html.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

upload_public_htaccess()
