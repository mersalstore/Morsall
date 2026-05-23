import zipfile
import os

zip_path = 'fixes.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('.htaccess', '.htaccess')
    zipf.write('server.js', 'server.js')
    
    # Add .next directory
    next_dir = '.next'
    for root, dirs, files in os.walk(next_dir):
        # Exclude cache to make it smaller
        if 'cache' in root:
            continue
        for file in files:
            file_path = os.path.join(root, file)
            arcname = file_path # keep .next/ structure
            zipf.write(file_path, arcname)

print("Created fixes.zip")
