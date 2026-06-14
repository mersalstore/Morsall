import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open(r"D:\New-folder\matger2\src\components\admin\OrdersTable.tsx", "r", encoding="utf-8") as f:
    content = f.read()

for i, line in enumerate(content.split('\n'), 1):
    if 'totalAmount' in line or 'total' in line or 'paymentMethod' in line:
        print(f"Line {i}: {line.strip()}")
