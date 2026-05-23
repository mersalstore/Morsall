import ftplib
from io import BytesIO

def check_file():
    try:
        ftp = ftplib.FTP('82.198.228.182')
        ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
        ftp.cwd('/public_html')
        buf = BytesIO()
        ftp.retrbinary('RETR copy_to_nodeapp.php', buf.write)
        print(buf.getvalue().decode())
    except Exception as e:
        print(f"Error: {e}")

check_file()
