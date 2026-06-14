import ftplib
import urllib.request
import ssl
import time

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    ftp = ftplib.FTP(host)
    ftp.login(user, pasw)
    print("Logged in")
    # Go to /public_html
    ftp.cwd("..")
    ftp.cwd("public_html")
    print("PWD:", ftp.pwd())
    
    # Upload check_processes.php
    with open("check_processes.php", "rb") as f:
        ftp.storbinary("STOR check_processes.php", f)
    print("Uploaded check_processes.php")
    
    # Rename .htaccess to .htaccess_temp_off
    htaccess_exists = ".htaccess" in ftp.nlst()
    if htaccess_exists:
        ftp.rename(".htaccess", ".htaccess_temp_off")
        print("Renamed .htaccess to .htaccess_temp_off")
    else:
        print(".htaccess not found")
        
    try:
        # Wait a second for Apache to reload htaccess
        time.sleep(1.5)
        
        # Call the URL
        url = "https://morsall.com/check_processes.php"
        print(f"Calling URL: {url}")
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(url, context=ctx) as response:
            html = response.read().decode('utf-8')
            print("\n=== Response from Server ===")
            print(html)
    except Exception as e:
        print(f"Error calling URL: {e}")
    finally:
        # Restore .htaccess
        if htaccess_exists:
            try:
                ftp.rename(".htaccess_temp_off", ".htaccess")
                print("Restored .htaccess")
            except Exception as e:
                print(f"Error restoring .htaccess: {e}")
        ftp.quit()

if __name__ == "__main__":
    main()
