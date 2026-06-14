import ftplib
import urllib.request
import ssl

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
    
    # Upload filesystem_check.php
    with open("filesystem_check.php", "rb") as f:
        ftp.storbinary("STOR filesystem_check.php", f)
    print("Uploaded filesystem_check.php")
    ftp.quit()
    
    # Call the URL
    url = "https://morsall.com/filesystem_check.php"
    print(f"Calling URL: {url}")
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(url, context=ctx) as response:
            html = response.read().decode('utf-8')
            print("\n=== Response from Server ===")
            print(html)
    except Exception as e:
        print(f"Error calling URL: {e}")

if __name__ == "__main__":
    main()
