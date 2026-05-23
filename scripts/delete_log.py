import ftplib

def delete_log_and_check():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("public_html/app_new")
        try:
            ftp.delete("server.log")
            print("Deleted server.log")
        except Exception as e:
            print(f"Could not delete server.log: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    delete_log_and_check()
