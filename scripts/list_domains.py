import ftplib

def list_domains():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd("/")
        try:
            print("Files in domains/morsall.com:", ftp.nlst("domains/morsall.com"))
        except Exception as e:
            # Maybe it's just 'domains' first
            print(f"Error listing domains/morsall.com: {e}")
            print("Trying to list 'domains'...")
            print("Files in domains:", ftp.nlst("domains"))
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_domains()
