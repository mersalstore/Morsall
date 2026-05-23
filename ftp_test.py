import ftplib

try:
    ftp = ftplib.FTP('82.198.228.182')
    ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')
    print("PWD:", ftp.pwd())
    
    print("\nRoot DIR:")
    ftp.dir()
    
    try:
        ftp.cwd('..')
        print("\n.. DIR PWD:", ftp.pwd())
        ftp.dir()
    except Exception as e:
        print(f"Error cwd ..: {e}")

    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
