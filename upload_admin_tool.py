import ftplib

ftp = ftplib.FTP('82.198.228.182')
ftp.login('u754458241.morsall.com', 'l$9Qs3i]g0y]/V~k')

for fname in ['set_admin_pass.php', 'reset_account.php', 'force_admin.php']:
    print(f"Uploading {fname}...")
    with open(fname, 'rb') as f:
        ftp.storbinary(f'STOR {fname}', f)
        print(f"Uploaded {fname}!")

ftp.quit()
