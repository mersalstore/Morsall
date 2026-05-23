import ftplib

def delete_log():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        ftp.cwd("app_new")
        try:
            ftp.delete("server.log")
            print("Deleted server.log")
        except Exception as e:
            print(f"Error deleting: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    delete_log()
