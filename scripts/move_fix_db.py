import ftplib

def move_fix_db():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        try:
            # Move from /fix_db.php to /public_html/fix_db_root.php
            ftp.rename("/fix_db.php", "/public_html/fix_db_root.php")
            print("Moved fix_db.php to public_html/fix_db_root.php")
        except Exception as e:
            print(f"Error moving: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    move_fix_db()
