import os
for root, dirs, files in os.walk(r"D:\New-folder\matger2\src"):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            fp = os.path.join(root, f)
            try:
                with open(fp, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if '/api/admin/orders' in content or '/api/orders' in content:
                        print(f"=== Found in {f} ===")
                        for i, line in enumerate(content.split('\n'), 1):
                            if '/api/admin/orders' in line or '/api/orders' in line:
                                print(f"  Line {i}: {line.strip()}")
            except Exception:
                pass
