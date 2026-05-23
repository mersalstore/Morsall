import ftplib

FTP_HOST = "82.198.228.182"
FTP_USER = "u754458241.morsall.com"
FTP_PASS = "l$9Qs3i]g0y]/V~k"

def list_files():
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.cwd("/public_html")
        print("Files in /public_html:")
        ftp.retrlines('LIST')
        
        if 'tmp' in ftp.nlst():
            ftp.cwd('tmp')
            print("\nFiles in /public_html/tmp:")
            ftp.retrlines('LIST')
            
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_files()
