import os
for root, dirs, files in os.walk(r"D:\New-folder\matger2\src"):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx') or f.endswith('.js'):
            fp = os.path.join(root, f)
            try:
                with open(fp, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if 'paymentMethod' in content:
                        for line in content.split('\n'):
                            if 'paymentMethod' in line and ('===' in line or '==' in line or 'value' in line or 'case' in line):
                                print(f"{f}: {line.strip()}")
            except Exception:
                pass
