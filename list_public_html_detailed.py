import ftplib

def list_public_html_detailed():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("public_html")
        print("Detailed listing of public_html:")
        ftp.dir()
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

list_public_html_detailed()
