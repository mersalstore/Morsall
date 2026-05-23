import zipfile
import os

zip_path = 'fixes2.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('.htaccess', '.htaccess')
    zipf.write('server.js', 'server.js')
    zipf.write('server-hostinger.js', 'server-hostinger.js')
    
    # Add ENTIRE .next directory
    next_dir = '.next'
    for root, dirs, files in os.walk(next_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = file_path
            zipf.write(file_path, arcname)

    # Add ENTIRE public directory
    public_dir = 'public'
    for root, dirs, files in os.walk(public_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = file_path
            zipf.write(file_path, arcname)

print("Created fixes2.zip with .next and public")
