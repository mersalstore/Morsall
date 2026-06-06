import os
import zipfile

def create_full_deploy():
    zip_name = 'fast_update.zip'
    dirs_to_zip = ['.next', '_next', 'src', 'public', 'prisma']
    files_to_zip = ['server.js', 'server-hostinger.js', 'emergency_deploy.php', 'package.json', 'next.config.js', '.env.production', 'mail_proxy.php']
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for d in dirs_to_zip:
            if os.path.exists(d):
                for root, _, files in os.walk(d):
                    # Skip .next/cache to keep it small
                    if '.next' in d and 'cache' in root:
                        continue
                    # Skip semantic search to prevent extraction errors on Hostinger
                    if 'semantic' in root:
                        continue
                    for file in files:
                        if 'semantic' in file:
                            continue
                        zipf.write(os.path.join(root, file), os.path.join(d, os.path.relpath(os.path.join(root, file), d)))
        for f in files_to_zip:
            if os.path.exists(f):
                zipf.write(f, f)
    print(f"Created {zip_name}")

create_full_deploy()
