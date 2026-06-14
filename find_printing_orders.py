import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open(r"D:\New-folder\matger2\src\app\admin\dashboard\DashboardClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

for i, line in enumerate(content.split('\n'), 1):
    if 'printingOrders' in line or 'setPrintingOrders' in line:
        print(f"Line {i}: {line.strip()}")
