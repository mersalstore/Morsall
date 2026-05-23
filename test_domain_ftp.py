import ftplib

def try_domain_ftp():
    host = "morsall.com"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print(f"Successfully connected to {host}")
        print("Root Files:", ftp.nlst())
        ftp.quit()
    except Exception as e:
        print(f"Failed to connect to {host}: {e}")

try_domain_ftp()
