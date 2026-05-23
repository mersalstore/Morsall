import zipfile
import os

def zip_all_except(zip_name, exclude_dirs):
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('node_modules'):
            # Filter out excluded top-level directories
            rel_path = os.path.relpath(root, 'node_modules')
            top_dir = rel_path.split(os.sep)[0]
            
            if top_dir in exclude_dirs:
                continue
                
            for file in files:
                full_path = os.path.join(root, file)
                zipf.write(full_path, os.path.relpath(full_path, '.'))

exclude = ['.prisma', '.cache', 'prisma', 'next', '@next']
print(f"Zipping node_modules except: {exclude}")
zip_all_except('remaining_modules.zip', exclude)
print("✅ Created remaining_modules.zip")
