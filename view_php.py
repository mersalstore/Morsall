import ftplib

def view_php():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        with open("link_nm.txt", "wb") as f:
            ftp.retrbinary("RETR link_node_modules.php", f.write)
        with open("rename_nm.txt", "wb") as f:
            ftp.retrbinary("RETR rename_node_modules.php", f.write)
        ftp.quit()
        print("Done")
    except Exception as e:
        print(f"Error: {e}")

view_php()
