import os
for root, dirs, files in os.walk(r"D:\New-folder\matger2\src\app\api\admin"):
    for f in files:
        if f.endswith('.ts') or f.endswith('.js'):
            print(os.path.join(root, f))
