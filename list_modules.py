import ftplib

def list_modules():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('node_modules_prisma_only')
        print(ftp.nlst()[:20])
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

list_modules()
