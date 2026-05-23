import subprocess

try:
    print("Fetching STAGED version of LogisticsTab.tsx...")
    res = subprocess.run(["git", "show", ":src/components/admin/LogisticsTab.tsx"], capture_output=True, check=True)
    content = res.stdout.decode("utf-8", errors="ignore")
    
    with open("scratch/staged_LogisticsTab.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Saved staged version to scratch/staged_LogisticsTab.tsx")
except Exception as e:
    print(f"Error: {e}")
