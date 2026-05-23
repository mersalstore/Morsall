import ftplib
import urllib.request
import os

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    try:
        # 1. Upload via FTP
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        try:
            ftp.cwd('..')
            ftp.cwd('public_html')
        except:
            ftp.cwd('public_html')
            
        with open('view_logo.php', 'rb') as f:
            ftp.storbinary('STOR view_logo.php', f)
        ftp.quit()
        print("Uploaded view_logo.php successfully!")
        
        # 2. Call HTTP
        url = "https://morsall.com/view_logo.php"
        print(f"Calling: {url}")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            print("DB RESPONSE:")
            print(html)
            
        # 3. Cleanup FTP
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        try:
            ftp.cwd('..')
            ftp.cwd('public_html')
        except:
            ftp.cwd('public_html')
        ftp.delete('view_logo.php')
        ftp.quit()
        print("Cleaned up view_logo.php from server.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
