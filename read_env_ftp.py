import ftplib

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    ftp.cwd('..')
    ftp.cwd('nodejs')
    lines = []
    ftp.retrlines('RETR .env', lines.append)
    print('\n'.join(lines))
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
