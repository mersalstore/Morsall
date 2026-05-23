import os
import zipfile

def create_prisma_zip():
    zip_name = 'prisma_fix.zip'
    # We need @prisma/client and .prisma
    paths = [
        'node_modules/@prisma/client',
        'node_modules/.prisma'
    ]
    
    with zipfile.ZipZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for p in paths:
            if os.path.exists(p):
                for root, _, files in os.walk(p):
                    for file in files:
                        full_path = os.path.join(root, file)
                        zipf.write(full_path, os.path.relpath(full_path, os.path.dirname(os.path.dirname(p))))
    print(f"Created {zip_name}")

# Correcting the zip creation
def create_prisma_fix():
    zip_name = 'prisma_fix.zip'
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Zip node_modules/@prisma/client
        src1 = 'node_modules/@prisma/client'
        if os.path.exists(src1):
            for root, _, files in os.walk(src1):
                for file in files:
                    full_path = os.path.join(root, file)
                    zipf.write(full_path, os.path.join('@prisma/client', os.path.relpath(full_path, src1)))
        # Zip node_modules/.prisma
        src2 = 'node_modules/.prisma'
        if os.path.exists(src2):
            for root, _, files in os.walk(src2):
                for file in files:
                    full_path = os.path.join(root, file)
                    zipf.write(full_path, os.path.join('.prisma', os.path.relpath(full_path, src2)))
    print(f"Created {zip_name}")

create_prisma_fix()
