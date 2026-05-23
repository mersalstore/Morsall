import ftplib

def download_log_app_new():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    remote_path = "app_new/stderr.log"
    local_path = "app_new_stderr.log"
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        with open(local_path, "wb") as f:
            ftp.retrbinary(f"RETR {remote_path}", f.write)
        print(f"Downloaded {remote_path} to {local_path}")
        ftp.quit()
    except Exception as e:
        print(f"FTP Failed: {e}")

download_log_app_new()
