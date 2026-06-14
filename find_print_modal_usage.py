import os
for root, dirs, files in os.walk(r"D:\New-folder\matger2\src"):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            fp = os.path.join(root, f)
            try:
                with open(fp, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if 'PrintPolicyModal' in content:
                        print(f"=== Found in {f} ===")
                        for i, line in enumerate(content.split('\n'), 1):
                            if 'PrintPolicyModal' in line or 'orders=' in line:
                                print(f"  Line {i}: {line.strip()}")
            except Exception:
                pass
