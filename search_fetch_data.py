import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open(r"D:\New-folder\matger2\src\app\admin\dashboard\DashboardClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("const fetchData")
if idx != -1:
    print(content[idx:idx+800])
else:
    print("fetchData not found")
