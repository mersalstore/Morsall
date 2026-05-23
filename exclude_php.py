import ftplib
def exclude_php():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open('.htaccess_new', 'w') as f:
            f.write("PassengerEnabled on\n")
            f.write("PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs\n")
            f.write("PassengerAppType node\n")
            f.write("PassengerStartupFile server-hostinger.js\n")
            f.write("PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node\n")
            f.write("\n")
            f.write("RewriteEngine On\n")
            f.write("# Exclude PHP files from Passenger\n")
            f.write("RewriteCond %{REQUEST_FILENAME} \\.php$\n")
            f.write("RewriteRule ^ - [L]\n")
            f.write("\n")
            f.write("RewriteCond %{HTTPS} off\n")
            f.write("RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n")
        with open('.htaccess_new', 'rb') as f:
            ftp.storbinary('STOR .htaccess', f)
        ftp.quit()
        print("HTACCESS Updated with PHP exclusion.")
    except Exception as e:
        print(f"Error: {e}")
exclude_php()
