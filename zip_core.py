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
    'node_modules/next',
    'node_modules/react',
    'node_modules/react-dom',
    'node_modules/dotenv',
    'node_modules/next-auth',
    'node_modules/bcryptjs',
    'node_modules/clsx',
    'node_modules/date-fns',
    'node_modules/framer-motion',
    'node_modules/lucide-react',
    'node_modules/tailwind-merge'
]

# Only zip if they exist
existing = [d for d in modules_to_zip if os.path.isdir(d)]
print(f"Zipping: {existing}")
zip_dirs(existing, 'core_modules.zip')
print("✅ Created core_modules.zip")
