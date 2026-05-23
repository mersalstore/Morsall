import ftplib
import os
import requests

def upload_and_call(local, remote):
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('/public_html')
        with open(local, 'rb') as f:
            ftp.storbinary(f'STOR {remote}', f)
        ftp.quit()
        print(f"Successfully uploaded {remote}")
        r = requests.get(f"https://morsall.com/{remote}", verify=False)
        print(f"Server Response:\n{r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_and_call('read_log.php', 'check_log_now.php')
