import zipfile
import os

def zip_dirs(dirs, zip_name):
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for d in dirs:
            for root, _, files in os.walk(d):
                for file in files:
                    zipf.write(os.path.join(root, file), 
                               os.path.relpath(os.path.join(root, file), '.'))

modules_to_zip = [
    'node_modules/@next',
    'node_modules/styled-jsx'
]

# Only zip if they exist
existing = [d for d in modules_to_zip if os.path.isdir(d)]
print(f"Zipping: {existing}")
zip_dirs(existing, 'next_at_modules.zip')
print("✅ Created next_at_modules.zip")
