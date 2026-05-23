import ftplib

def toggle_htaccess():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        # Already in /public_html
        try:
            ftp.rename(".htaccess", ".htaccess_bak")
            print("Renamed .htaccess to .htaccess_bak")
            ftp.rename(".htaccess_bak", ".htaccess")
            print("Renamed .htaccess_bak back to .htaccess")
        except Exception as e:
            print(f"Error: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    toggle_htaccess()
