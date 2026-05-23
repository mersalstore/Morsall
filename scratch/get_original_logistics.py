import subprocess

try:
    print("Fetching HEAD version of LogisticsTab.tsx...")
    res = subprocess.run(["git", "show", "HEAD:src/components/admin/LogisticsTab.tsx"], capture_output=True, check=True)
    content = res.stdout.decode("utf-8", errors="ignore")
    
    with open("scratch/original_LogisticsTab.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Saved original version to scratch/original_LogisticsTab.tsx")
except Exception as e:
    print(f"Error: {e}")
