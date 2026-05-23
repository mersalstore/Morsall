import ftplib
def disable_passenger():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open('.htaccess_temp', 'w') as f:
            f.write("RewriteEngine On\n")
            f.write("RewriteCond %{HTTPS} off\n")
            f.write("RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n")
        with open('.htaccess_temp', 'rb') as f:
            ftp.storbinary('STOR .htaccess', f)
        ftp.quit()
        print("Passenger DISABLED.")
    except Exception as e:
        print(f"Error: {e}")
disable_passenger()
