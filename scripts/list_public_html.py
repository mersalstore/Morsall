import ftplib

def list_public_html():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("/")
        print("Root files:", ftp.nlst())
        try:
            print("Files in public_html:", ftp.nlst("public_html"))
        except Exception as e:
            print(f"Error listing public_html: {e}")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_public_html()
